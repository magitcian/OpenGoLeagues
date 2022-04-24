const express = require('express')
const router = express.Router();
const cors = require('cors')
const { User, AnalyzedGame } = require("../models");
const { validateToken } = require("../middlewares/AuthMiddleware");

let fileDestination = "./SGFfiles/";

router.post('/analyzed', validateToken, async function (req, res) {
    const { fileId } = req.body;
    const sgfFile = await AnalyzedGame.findOne({ where: { id: fileId, PlayerUserId: req.user.id, status: 0 } });
    if (sgfFile) {
        await createAnalysisFileWithLeela("w", sgfFile);
        let analyzedGame = await updateAnalysisInDB(sgfFile);
        res.json({ AnalyzedGame: analyzedGame });
    } else {
        res.json({ error: "There is no game to analyze!" });
    }
})

function getLeelazPathAccordingToOS(OStype) {
    let leelazPath = "";
    let networkPath = "";
    if (OStype == "w") {
        leelazPath = '../leelaZero/win/leela-zero-0.17-win64/leelaz.exe';
        networkPath = '..\\leelaZero\\networks\\best-network'
    } else {
        leelazPath = '../leelaZero/linux/leela-zero/build/leelaz';
        networkPath = '../leelaZero/networks/best-network';
    }
    let leelaz = {
        "path": leelazPath,
        "networkPath": networkPath,
    }
    return leelaz;
}

function createAnalysisFileWithLeela(OStype, sgfFile) {

    return new Promise(async (resolve, reject) => {
        const sleep1S = 1000;
        const sleep3S = 3000;

        const { spawn } = require('child_process');
        let leelaz = getLeelazPathAccordingToOS(OStype);
        const bat = spawn(leelaz.path, ['-w', leelaz.networkPath, '-g', '--lagbuffer', '0']);
    
        const fs = require('fs')
        let rep_analyze = "";
        let rep_move = "";
        let finish = false;

        bat.stdout.on('data', async (data) => {
            rep_move += data.toString();
            console.log(data.toString());
            if (rep_move.includes("cannot undo") && !finish) {
                finish = true;
                fs.writeFile(fileDestination + sgfFile.SgfFileName.substring(0, sgfFile.SgfFileName.length - 4) + '_analyze.txt', rep_analyze, err => {
                    if (err) {
                        console.error(err);
                        reject("FAILURE");
                    }else{
                        resolve("SUCCESS");
                    }
                    return;
                })
                console.log("finish!");
                bat.stdin.write("quit\n");
                bat.kill();
            }
        });
    
        let i = 4;
        let prevRep = "";
        bat.stderr.on('data', async (data) => {
            let curRep = data.toString();
            rep_analyze += curRep;
            console.log(curRep);
            if ((prevRep + curRep).includes("visits,")) {
                ++i;
                bat.stdin.write(i.toString() + " undo \n");
                await sleep(sleep1S);
                ++i;
                bat.stdin.write(i.toString() + " lz-analyze 0 \n");
                prevRep = "";
            }else{
                prevRep = curRep;
            }
        });
    
        
        bat.on('exit', (code) => {
            console.log(`Child exited with code ${code}`);
        });
    
        bat.stdin.write(1 + " loadsgf " + fileDestination + sgfFile.SgfFileName + "\n");
        if (OStype == "w") {
            bat.stdin.write(2 + " lz-setoption name visits value " + sgfFile.VisitsAverage + "\n");
        }
        await sleep(sleep3S);
        bat.stdin.write(3 + " undo \n");
        await sleep(sleep1S);
        bat.stdin.write(4 + " lz-analyze 0 \n");

      })

}


async function updateAnalysisInDB(sgfFile) {
    const sgfFileController = require("./SGFfile");
    let listOfMoves = await sgfFileController.getMovesFromFile(fileDestination + sgfFile.SgfFileName);
    let listOfLeelazMoves = await getProposedMovesFromAnalysisFile(fileDestination + sgfFile.SgfFileName.substring(0, sgfFile.SgfFileName.length - 4) + '_analyze.txt');
    // console.log(1, listOfMoves);
    // console.log(2, listOfLeelazMoves);
    let analyzedGame = getAnalyzedGame(sgfFile, listOfMoves, listOfLeelazMoves);
    await AnalyzedGame.update(analyzedGame, { where: { id: analyzedGame.id } });
    return analyzedGame;
};

function getAnalyzedGame(sgfFile, listOfMoves, listOfLeelazMoves) {
    let black1stChoice = 0;
    let black2ndChoice = 0;
    let blackNot12Choice = 0;
    let blackUnexpectedMoves = 0;

    let white1stChoice = 0;
    let white2ndChoice = 0;
    let whiteNot12Choice = 0;
    let whiteUnexpectedMoves = 0;

    let visitsAverage = 0;
    let countMove = listOfMoves.length > 150 ? 150 : listOfMoves.length; //pour n'analyser que les 150 premiers coups
    for (let i = 0; i < countMove; ++i) {

        let move = listOfMoves[i];
        let LeelazMoves = listOfLeelazMoves[i];
        visitsAverage += parseInt(LeelazMoves[0].visits);

        if (move.colorShort == "W") {
            if (move.posLeela == LeelazMoves[0].position) {
                ++white1stChoice;
            } else if (move.posLeela == LeelazMoves[1].position && Math.abs(LeelazMoves[0].pourcent - LeelazMoves[1].pourcent) < 2.5) {
                ++white2ndChoice;
            } else {
                ++whiteNot12Choice;
            }
        } else if (move.colorShort == "B") {
            if (move.posLeela == LeelazMoves[0].position) {
                ++black1stChoice;
            } else if (move.posLeela == LeelazMoves[1].position && Math.abs(LeelazMoves[0].pourcent - LeelazMoves[1].pourcent) < 2.5) {
                ++black2ndChoice;
            } else {
                ++blackNot12Choice;
            }
        } else {
            console.error("prob");
        }

        let notMatch = true;
        LeelazMoves.forEach(leelazMove => {
            if (move.posLeela == leelazMove.position && Math.abs(LeelazMoves[0].pourcent - leelazMove.pourcent) < 5) {
                notMatch = false;
            }
        })
        if (notMatch) {
            if (move.colorShort == "W") {
                ++whiteUnexpectedMoves;
            } else if (move.colorShort == "B") {
                ++blackUnexpectedMoves;
            }
            //console.log(m.toString());
        }
    }

    visitsAverage = Math.floor(visitsAverage/countMove);
    let blackMatchRateOfMoves1And2 = ((black1stChoice) / (black1stChoice + black2ndChoice + blackNot12Choice) * 100).toFixed(2);
    let blackTotalAnalyzedMoves = black1stChoice + black2ndChoice + blackNot12Choice;
    let isBlackCheating = false;
    if ((blackMatchRateOfMoves1And2 > 85 && sgfFile.BlackLevel < 6) || blackMatchRateOfMoves1And2 > (3.324 * sgfFile.BlackLevel + 58.78)) {
        isBlackCheating = true;
    }

    let whiteMatchRateOfMoves1And2 = ((white1stChoice) / (white1stChoice + white2ndChoice + whiteNot12Choice) * 100).toFixed(2);
    let whiteTotalAnalyzedMoves = white1stChoice + white2ndChoice + whiteNot12Choice;
    let isWhiteCheating = false;
    if ((whiteMatchRateOfMoves1And2 > 85 && sgfFile.WhiteLevel < 6) || whiteMatchRateOfMoves1And2 > (3.324 * sgfFile.WhiteLevel + 58.78)) {
        isWhiteCheating = true;
    }

    let analyzedGame = {
        "BlackLevel": sgfFile.BlackLevel,
        "Black1stChoice": black1stChoice,
        "Black2ndChoice": black2ndChoice,
        "BlackTotalAnalyzedMoves": blackTotalAnalyzedMoves,
        "BlackUnexpectedMoves": blackUnexpectedMoves,
        "BlackMatchRateOfMoves1And2": blackMatchRateOfMoves1And2,
        "IsBlackCheating": isBlackCheating,

        "WhiteLevel": sgfFile.WhiteLevel,
        "White1stChoice": white1stChoice,
        "White2ndChoice": white2ndChoice,
        "WhiteTotalAnalyzedMoves": whiteTotalAnalyzedMoves,
        "WhiteUnexpectedMoves": whiteUnexpectedMoves,
        "WhiteMatchRateOfMoves1And2": whiteMatchRateOfMoves1And2,
        "IsWhiteCheating": isWhiteCheating,

        "id": sgfFile.id,
        "SgfFileName": sgfFile.SgfFileName,
        "PlayerUserId": sgfFile.PlayerUserId,
        "Status": 1,
        "VisitsAverage": visitsAverage,
    }
    //console.log(analyzedGame);
    return analyzedGame;
}

async function getProposedMovesFromAnalysisFile(analysisFilePath) {
    let arrayOfAnalysisList = new Array();
    let contentBin = await loadFileContent(analysisFilePath);
    let contentStr = contentBin.toString();
    let arrayOfAnalysisStr = contentStr.split("NN eval=");

    for (let i = arrayOfAnalysisStr.length - 1; i > 0; --i) {
        let listOfProposedMoves = new Array();
        let AnalysisStr = arrayOfAnalysisStr[i].split("\r\n"); // "\n" : sur linux

        let visits = 0;
        if (AnalysisStr[AnalysisStr.length - 3].includes("visits")) {
            visits = AnalysisStr[AnalysisStr.length - 3].split("visits")[0].trim();
        }

        for (let j = 2; j < AnalysisStr.length; ++j) {
            let analyzeSplit = AnalysisStr[j].split("->");

            if (analyzeSplit.length > 1) {
                let proposedMove = {
                    "position": analyzeSplit[0].trim(),
                    "pourcent": analyzeSplit[1].substring(12, 18).trim(),
                    "visits": visits,
                }
                listOfProposedMoves.push(proposedMove);
            }
        }
        arrayOfAnalysisList.push(listOfProposedMoves);
    }
    //console.log(arrayOfAnalysisList);
    return arrayOfAnalysisList;
}

async function loadFileContent(filePath) {
    const fs = require('fs').promises;
    const data = await fs.readFile(filePath, "binary");
    return new Buffer.from(data);
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

//pour lancer à part dans le terminal backend/controllers: 
//node -e 'require("./LeelaZero").finalAnalyze("../SGFfiles/liusasori-pinenisan2_2022-03-15_22.37.49.sgf")'
//node -e 'require("./LeelaZero").testAnalyze()'

module.exports = router;
