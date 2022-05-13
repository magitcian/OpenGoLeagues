const express = require('express')
const router = express.Router();
const cors = require('cors')
const { User, AnalyzedSGFfile, AnalyzedGame } = require("../models");
const { validateToken } = require("../middlewares/AuthMiddleware");
const sgfFileController = require("./SGFfile");
const OStype = "w"; // l for linux
const NumOfMovesToAnalyze = 150;

router.post('/analyzed', validateToken, async function (req, res) {
    const { fileId } = req.body;
    const sgfFile = await AnalyzedSGFfile.findOne({
        where: { id: fileId, PlayerUserId: req.user.id, status: 0 },
        include: [{
            model: AnalyzedGame,
            order: [
                ['Color', 'ASC'],
            ],
        }],
    });
    if (sgfFile) {
        const filePath = "./SGFfiles/";
        await createAnalysisFileWithLeela(filePath, sgfFile);
        let analyzedSGFfile = await updateAnalysisInDB(filePath, sgfFile);
        res.json({ AnalyzedSGFfile: analyzedSGFfile });
    } else {
        res.json({ error: "There is no game to analyze!" });
    }
})

function getLeelazPathAccordingToOS(sgfFile) {
    let leelazPath = 'leelaZero/linux/leela-zero/build/leelaz'; //linux
    let networkPath = 'leelaZero/networks/best-network';
    if (OStype == "w") {
        leelazPath = 'leelaZero/win/leela-zero-0.17-win64/leelaz.exe'; //windows
    }
    if (sgfFile.ForStatistics) {
        leelazPath = '../' + leelazPath;
        networkPath = '../' + networkPath;
    }
    let leelaz = {
        "path": leelazPath,
        "networkPath": networkPath,
    }
    return leelaz;
}

function createAnalysisFileWithLeela(filePath, sgfFile) {
    return new Promise(async (resolve, reject) => {
        const sleep0p5S = 500;
        const sleep10S = 10000;

        const { spawn } = require('child_process');
        let leelaz = getLeelazPathAccordingToOS(sgfFile);
        const bat = spawn(leelaz.path, ['--gtp', '--weights', leelaz.networkPath, '--visits', sgfFile.VisitsAverage ]);

        const fs = require('fs');
        let rep_analyze = "";
        let rep_move = "";
        let finish = false;

        bat.stdout.on('data', async (data) => {
            rep_move += data.toString();
            console.log(data.toString());
            if (rep_move.includes("cannot undo") && !finish) {
                finish = true;
                fs.writeFile(filePath + sgfFile.SgfFileName.substring(0, sgfFile.SgfFileName.length - 4) + '_analyze.txt', rep_analyze, err => {
                    if (err) {
                        console.error(err);
                        reject("FAILURE");
                    } else {
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
                await sleep(sleep0p5S);
                ++i;
                bat.stdin.write(i.toString() + " lz-analyze 0 \n");
                prevRep = "";
            } else {
                prevRep = curRep;
            }
        });

        bat.stdin.write(1 + " loadsgf " + filePath + sgfFile.SgfFileName + "\n");
        // if (OStype == "w") {
        //     bat.stdin.write(2 + " lz-setoption name visits value " + sgfFile.VisitsAverage + "\n");
        // }
        await sleep(sleep10S);

        let listOfMoves = await sgfFileController.getMovesFromSGFfile(filePath + sgfFile.SgfFileName);
        let movesNotToAnalyse = listOfMoves.length - NumOfMovesToAnalyze;
        while (movesNotToAnalyse > 0) {
            console.log(movesNotToAnalyse, "undo!");
            bat.stdin.write(3 + " undo \n");
            await sleep(sleep0p5S);
            --movesNotToAnalyse;
        }
        bat.stdin.write(4 + " lz-analyze 0 \n");

        bat.on('exit', (code) => {
            console.log(`Child exited with code ${code}`);
        });

    })

}


async function updateAnalysisInDB(filePath, sgfFile) {
    const sgfFileController = require("./SGFfile");
    let listOfMoves = await sgfFileController.getMovesFromSGFfile(filePath + sgfFile.SgfFileName);
    let listOfLeelazMoves = await getProposedMovesFromAnalysisFile(filePath + sgfFile.SgfFileName.substring(0, sgfFile.SgfFileName.length - 4) + '_analyze.txt');
    let analyzedSGFfile = getAnalyzedGame(sgfFile, listOfMoves, listOfLeelazMoves);
    await AnalyzedSGFfile.update(analyzedSGFfile, { where: { id: analyzedSGFfile.id } });
    analyzedSGFfile.AnalyzedGames.forEach(game => {
        AnalyzedGame.update(game, { where: { AnalyzedSGFfileId: analyzedSGFfile.id, Color: game.Color } });
    });
    return analyzedSGFfile;
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
    const countMove = listOfMoves.length > NumOfMovesToAnalyze ? NumOfMovesToAnalyze : listOfMoves.length; //pour n'analyser que les 150 premiers coups
    //const countHandStones = listOfMoves.filter(m => m.handicapStone).length;
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

    let blackLevelValue = sgfFile.AnalyzedGames.find(g => g.Color == "b") ? sgfFile.AnalyzedGames.find(g => g.Color == "b").LevelValue : undefined;
    let whiteLevelValue = sgfFile.AnalyzedGames.find(g => g.Color == "w") ? sgfFile.AnalyzedGames.find(g => g.Color == "w").LevelValue : undefined;

    visitsAverage = Math.floor(visitsAverage / countMove);

    let blackPlayer = {
        "Color": "b",
        "LevelValue": blackLevelValue,
        "1stChoice": black1stChoice,
        "2ndChoice": black2ndChoice,
        "TotalAnalyzedMoves": black1stChoice + black2ndChoice + blackNot12Choice,
        "UnexpectedMoves": blackUnexpectedMoves,
        "IsCheating": false,
    }
    checkIfCheating(blackPlayer);

    let whitePlayer = {
        "Color": "w",
        "LevelValue": whiteLevelValue,
        "1stChoice": white1stChoice,
        "2ndChoice": white2ndChoice,
        "TotalAnalyzedMoves": white1stChoice + white2ndChoice + whiteNot12Choice,
        "UnexpectedMoves": whiteUnexpectedMoves,
        "IsCheating": false,
    }
    checkIfCheating(whitePlayer);

    let analyzedSGFfile = {
        "AnalyzedGames": [blackPlayer, whitePlayer],
        "id": sgfFile.id,
        "SgfFileName": sgfFile.SgfFileName,
        "PlayerUserId": sgfFile.PlayerUserId,
        "Status": 1,
        "VisitsAverage": visitsAverage,
    }
    //console.log(analyzedGame);
    return analyzedSGFfile;
}

function checkIfCheating(player) {
    let MatchRateOfMoves1 = (player["1stChoice"] / player.TotalAnalyzedMoves * 100).toFixed(2);
    let above3StandardDeviations = MatchRateOfMoves1 > (3.324 * player.LevelValue + 58.78); //    //The formula was calculated based on statistical analyzes
    if ((MatchRateOfMoves1 > 85 && player.LevelValue < 6) || above3StandardDeviations) {
        player.IsCheating = true;
    }
}

async function getProposedMovesFromAnalysisFile(analysisFilePath) {
    let arrayOfAnalysisList = new Array();
    let contentBin = await loadFileContent(analysisFilePath);
    let contentStr = contentBin.toString();
    let arrayOfAnalysisStr = contentStr.split("NN eval=");

    for (let i = arrayOfAnalysisStr.length - 1; i > 0; --i) {
        let listOfProposedMoves = new Array();
        let endOfFile = "\n";
        if (OStype == "w") {
            endOfFile = "\r" + endOfFile;
        }
        let AnalysisStr = arrayOfAnalysisStr[i].split(endOfFile);

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

//module.exports = router;

module.exports = {
    router: router,
    createAnalysisFileWithLeela: createAnalysisFileWithLeela,
    getProposedMovesFromAnalysisFile: getProposedMovesFromAnalysisFile,
    getAnalyzedGame: getAnalyzedGame,
}