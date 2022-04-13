const express = require('express')
const router = express.Router();
const cors = require('cors')
const { User, AnalyzedGame } = require("../models");
const { validateToken } = require("../middlewares/AuthMiddleware");

let fileDestination = "./SGFfiles/";

router.post('/analyzed', validateToken, async function (req, res) {
    const { fileId } = req.body;
    const sgfFile = await AnalyzedGame.findOne({ where: { id: fileId, PlayerUserId: req.user.id } });
    if (sgfFile) {
        //console.log(sgfFile);
        await analyzeFileWithLeela("w", sgfFile.id, sgfFile.SgfFileName, sgfFile.BlackLevel, sgfFile.WhiteLevel);

        //leela.finalAnalyze(fileDestination + newFileName);
    }
    res.json({ rep: "in progress!" })
})


async function analyzeFileWithLeela(OStype, sgfFileId, sgfFileName, blackLevel, whiteLevel) {
    const { spawn } = require('child_process');
    let leelazPath = "";
    let networkPath = "";
    if (OStype == "w") {
        leelazPath = '../leelaZero/win/leela-zero-0.17-win64/leelaz.exe';
        networkPath = '..\\leelaZero\\networks\\best-network'
    } else {
        leelazPath = '../leelaZero/linux/leela-zero/build/leelaz';
        networkPath = '../leelaZero/networks/best-network';
    }
    const bat = spawn(leelazPath, ['-w', networkPath, '-g', '--lagbuffer', '0']);

    const fs = require('fs')
    let fini = false;
    let rep_analyze = "";
    let rep_move = "";

    bat.stdout.on('data', async (data) => {
        rep_move += data.toString();
        console.log(data.toString());
        if (rep_move.includes("cannot undo") && !fini) {
            fini = true;
            fs.writeFile(fileDestination + sgfFileName.substring(0, sgfFileName.length - 4) + '_analyze.txt', rep_analyze, err => {
                if (err) {
                    console.error(err)
                    return
                } else {
                    updateAnalysisInDB(sgfFileId, sgfFileName, blackLevel, whiteLevel);
                }
            })
            console.log("finish!");
            bat.stdin.write("quit\n");
            bat.kill();
        }
    });

    bat.stderr.on('data', (data) => {
        rep_analyze += data.toString();
        console.log(data.toString());
    });

    let i = 1;
    bat.stdin.write(i.toString() + " loadsgf " + fileDestination + sgfFileName + "\n");
    if (OStype == "w") {
        bat.stdin.write(i.toString() + " lz-setoption name visits value 500\n");
    }
    await sleep(2000);
    while (!fini) {

        ++i;
        //console.log(i);
        bat.stdin.write(i.toString() + " undo \n");
        await sleep(500);
        bat.stdin.write(i.toString() + " lz-analyze 0 \n");
        await sleep(1000);
    }


    bat.on('exit', (code) => {
        console.log(`Child exited with code ${code}`);
    });
}


async function updateAnalysisInDB(sgfFileId, sgfFileName, blackLevel, whiteLevel) {

    let black1stChoice = 0;
    let black2ndChoice = 0;
    let blackNot12Choice = 0;
    let blackUnexpectedMoves = 0;

    let white1stChoice = 0;
    let white2ndChoice = 0;
    let whiteNot12Choice = 0;
    let whiteUnexpectedMoves = 0;

    const sgfFile = require("./SGFfile");
    let listOfMoves = await sgfFile.getMovesFromFile(fileDestination + sgfFileName);
    let listOfLeelazMoves = await getProposedMovesFromAnalysisFile(fileDestination + sgfFileName.substring(0, sgfFileName.length - 4) + '_analyze.txt');
    // console.log(1, listOfMoves);
    // console.log(2, listOfLeelazMoves);

    let countMove = listOfMoves.length > 150 ? 150 : listOfMoves.length; //pour n'analyser que les 150 premiers coups
    for (let i = 0; i < countMove; ++i) {

        let move = listOfMoves[i];
        let LeelazMoves = listOfLeelazMoves[i];

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

    let blackMatchRateOfMoves1And2 = ((black1stChoice) / (black1stChoice + black2ndChoice + blackNot12Choice) * 100).toFixed(2);
    let blackTotalAnalyzedMoves = black1stChoice + black2ndChoice + blackNot12Choice;
    let isBlackCheating = false;
    if ((blackMatchRateOfMoves1And2 > 85 && blackLevel < 6) || blackMatchRateOfMoves1And2 > (3.324 * blackLevel + 58.78)) {
        isBlackCheating = true;
    }

    let whiteMatchRateOfMoves1And2 = ((white1stChoice) / (white1stChoice + white2ndChoice + whiteNot12Choice) * 100).toFixed(2);
    let whiteTotalAnalyzedMoves = white1stChoice + white2ndChoice + whiteNot12Choice;
    let isWhiteCheating = false;
    if ((whiteMatchRateOfMoves1And2 > 85 && whiteLevel < 6) || whiteMatchRateOfMoves1And2 > (3.324 * whiteLevel + 58.78)) {
        isWhiteCheating = true;
    }

    console.log("bl:" + blackLevel);
    console.log("wl:" + whiteLevel);

    let analyzedGame = {
        "BlackLevel": blackLevel,
        "Black1stChoice": black1stChoice,
        "Black2ndChoice": black2ndChoice,
        "BlackTotalAnalyzedMoves": blackTotalAnalyzedMoves,
        "BlackUnexpectedMoves": blackUnexpectedMoves,
        "BlackMatchRateOfMoves1And2": blackMatchRateOfMoves1And2,
        "IsBlackCheating": isBlackCheating,

        "WhiteLevel": whiteLevel,
        "White1stChoice": white1stChoice,
        "White2ndChoice": white2ndChoice,
        "WhiteTotalAnalyzedMoves": whiteTotalAnalyzedMoves,
        "WhiteUnexpectedMoves": whiteUnexpectedMoves,
        "WhiteMatchRateOfMoves1And2": whiteMatchRateOfMoves1And2,
        "IsWhiteCheating": isWhiteCheating,

        "SgfFileName": sgfFileName,
        "PlayerUserId": 2,
        "Status": 1,

    }
    console.log(analyzedGame);
    //await AnalyzedGame.create(analyzedGame);
    console.log(sgfFileId);
    await AnalyzedGame.update({
        Status: 1, Black1stChoice: black1stChoice, Black2ndChoice: black2ndChoice, BlackTotalAnalyzedMoves: blackTotalAnalyzedMoves, BlackUnexpectedMoves: blackUnexpectedMoves, BlackMatchRateOfMoves1And2: blackMatchRateOfMoves1And2, IsBlackCheating: isBlackCheating,
        White1stChoice: white1stChoice, White2ndChoice: white2ndChoice, WhiteTotalAnalyzedMoves: whiteTotalAnalyzedMoves, WhiteUnexpectedMoves: whiteUnexpectedMoves, WhiteMatchRateOfMoves1And2: whiteMatchRateOfMoves1And2, IsWhiteCheating: isWhiteCheating
    }
        , { where: { id: sgfFileId } });

};

async function getProposedMovesFromAnalysisFile(analysisFilePath) {
    let arrayOfAnalysisList = new Array();
    let contentBin = await loadFileContent(analysisFilePath);
    let contentStr = contentBin.toString();
    let arrayOfAnalysisStr = contentStr.split("NN eval=");

    for (let i = arrayOfAnalysisStr.length - 1; i > 0; --i) {
        let listOfAnalysis = new Array();
        let AnalysisStr = arrayOfAnalysisStr[i].split("\r\n"); // "\n" : sur linux

        for (let j = 2; j < AnalysisStr.length; ++j) {
            let analyzeSplit = AnalysisStr[j].split("->");

            if (analyzeSplit.length > 1) {
                let proposedMove = {
                    "position": analyzeSplit[0].trim(),
                    "pourcent": analyzeSplit[1].substring(12, 18).trim()
                }
                listOfAnalysis.push(proposedMove);
            }
        }
        arrayOfAnalysisList.push(listOfAnalysis);
    }
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
