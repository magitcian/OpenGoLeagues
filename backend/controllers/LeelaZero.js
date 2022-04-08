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
        analyzeFileWithLeela("w", sgfFile.id, sgfFile.SgfFileName, sgfFile.BlackLevel, sgfFile.WhiteLevel);
        
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
                    finalAnalyze(sgfFileId, sgfFileName, blackLevel, whiteLevel);
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

function finalAnalyze(sgfFileId, sgfFileName, blackLevel, whiteLevel) {

    const fs = require('fs');
    let rep_move = "";
    let rep_analyze = "";
    fs.readFile(fileDestination + sgfFileName, 'utf8', function (err, data_move) {
        rep_move = data_move;
        //console.log(rep_move);
        fs.readFile(fileDestination + sgfFileName.substring(0, sgfFileName.length - 4) + '_analyze.txt', 'utf8', async function (err, data_analyze) {
            rep_analyze = data_analyze;
            //console.log(rep_analyze);

            let black1stChoice = 0;
            let black2ndChoice = 0;
            let blackNot12Choice = 0;
            let blackUnexpectedMoves = 0;

            let white1stChoice = 0;
            let white2ndChoice = 0;
            let whiteNot12Choice = 0;
            let whiteUnexpectedMoves = 0;

            let analyzes = rep_analyze.split("NN eval=");

            let moves = rep_move.split(";");
            let listOfMoves = new Array();
            for (let m = 2; m < moves.length; ++m) {

                let moveStr = moves[m];
                let positionFile = moveStr.substring(2, 4).includes("]") ? "pass" : moveStr.substring(2, 4);
                let alphaNormal = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's'];
                let alphaLeela = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T']; //pas de i !!!!

                let posLeela1 = "pass"
                let posLeela2 = 0;
                if (positionFile != "pass") {
                    posLeela1 = alphaLeela[alphaNormal.indexOf(positionFile.charAt(0))];
                    posLeela2 = 19 - alphaNormal.indexOf(positionFile.charAt(1));
                }
                //posLeela1 = String.fromCharCode(positionFile.charAt(0).charCodeAt(0)+1);
                let move =
                {
                    "colorShort": moveStr.substring(0, 1),
                    "colorLong": moveStr.substring(0, 1) == "W" ? "white" : "black",
                    "positionFile": positionFile,
                    "posLeela1": posLeela1,
                    "posLeela2": posLeela2,
                    "posLeela": posLeela1 == "pass" ? posLeela1 : posLeela1 + posLeela2,
                    "time": moveStr.substring(8, 10),
                }
                //console.log(move);
                listOfMoves.push(move);
            }
            // console.log(listOfMoves);
            // console.log(analyzes);
            // console.log(analyzes.length);
            // console.log(listOfMoves.length);
            let countMove = listOfMoves.length > 150 ? 150 : listOfMoves.length; //pour n'analyser que les 150 premiers coups

            for (let m = 0; m < countMove; ++m) {
                //console.log(analyzes);
                let analyzes2 = analyzes[listOfMoves.length - m].split("\r\n"); // "\n" : sur linux
                if (analyzes2.length > 3) {
                    //console.log(analyzes2);
                    let analyzes3 = analyzes2[2].split("->");
                    let analyze1 = {
                        "position": analyzes3[0].trim(),
                        "pourcent": analyzes3[1].substring(12, 18).trim(),
                    }
                    // let prop1 = analyzes3[0].trim();
                    // let pourcent = analyzes3[1].substring(12,18);

                    analyzes3 = analyzes2[3].split("->");
                    let analyze2 = {
                        "position": analyzes3[0].trim(),
                        "pourcent": analyzes3[1].substring(12, 18).trim(),
                    }
                    // let prop2 = analyzes3[0].trim();
                    let move = listOfMoves[m];
                    // console.log("prop1: " + analyze1.position);
                    // console.log("pourc1: " + analyze1.pourcent);
                    // console.log("prop2: " + analyze2.position);
                    // console.log("pourc2: " + analyze2.pourcent);
                    // console.log("move: " + move.posLeela);
                    //console.log("dif pourcent: " + Math.abs(analyze1.pourcent - analyze2.pourcent));

                    if (move.colorShort == "W") {
                        if (move.posLeela == analyze1.position) {
                            ++white1stChoice;
                        } else if (move.posLeela == analyze2.position && Math.abs(analyze1.pourcent - analyze2.pourcent) < 2.5) {
                            ++white2ndChoice;
                        } else {
                            ++whiteNot12Choice;
                        }
                    } else if (move.colorShort == "B") {
                        if (move.posLeela == analyze1.position) {
                            ++black1stChoice;
                        } else if (move.posLeela == analyze2.position && Math.abs(analyze1.pourcent - analyze2.pourcent) < 2.5) {
                            ++black2ndChoice;
                        } else {
                            ++blackNot12Choice;
                        }
                    } else {
                        console.error("prob");
                    }

                    //analyse que aucun coup ne correspond
                    //let analyzes2 = analyzes[countMove - m].split("\r\n");
                    let notMatch = true;
                    for (let a = 2; a < analyzes2.length; ++a) {
                        let analyzes4 = analyzes2[a].split("->");
                        //console.log(analyzes4);
                        if (analyzes4.length > 1) {
                            let analyze3 = {
                                "position": analyzes4[0].trim(),
                                "pourcent": analyzes4[1].substring(12, 18).trim()
                            }
                            if (move.posLeela == analyze3.position && Math.abs(analyze1.pourcent - analyze3.pourcent) < 5) {
                                notMatch = false;
                            }
                        }
                    }
                    if (notMatch) {
                        if (move.colorShort == "W") {
                            ++whiteUnexpectedMoves;
                        } else if (move.colorShort == "B") {
                            ++blackUnexpectedMoves;
                        }
                        //console.log(m.toString());
                    }
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
                "Status":1,

            }
            console.log(analyzedGame);
            //await AnalyzedGame.create(analyzedGame);
            console.log(sgfFileId);
            await AnalyzedGame.update({ Status:1, Black1stChoice: black1stChoice, Black2ndChoice: black2ndChoice, BlackTotalAnalyzedMoves: blackTotalAnalyzedMoves, BlackUnexpectedMoves : blackUnexpectedMoves, BlackMatchRateOfMoves1And2: blackMatchRateOfMoves1And2, IsBlackCheating : isBlackCheating,
                White1stChoice: white1stChoice, White2ndChoice: white2ndChoice, WhiteTotalAnalyzedMoves: whiteTotalAnalyzedMoves, WhiteUnexpectedMoves : whiteUnexpectedMoves, WhiteMatchRateOfMoves1And2: whiteMatchRateOfMoves1And2, IsWhiteCheating : isWhiteCheating}
            , { where: { id: sgfFileId } });

        });
    });
};
//pour lancer à part dans le terminal backend/controllers: 
//node -e 'require("./LeelaZero").finalAnalyze("../SGFfiles/liusasori-pinenisan2_2022-03-15_22.37.49.sgf")'
//node -e 'require("./LeelaZero").testAnalyze()'
function testAnalyze() {
    //à définir manuellement
    let playerId = 2;
    let blackLevel = 3;
    let whiteLevel = -1;
    let sgfFileName = '34485608-206-EdIV-dartagaluc_2022-03-18_14.59.03.sgf';
    let fileDestination = "../SGFfiles/";
    //console.log(fileDestination + sgfFileName);

    //--------------------------------------

    const fs = require('fs');
    let rep_move = "";
    let rep_analyze = "";
    fs.readFile(fileDestination + sgfFileName, 'utf8', function (err, data_move) {
        rep_move = data_move;
        console.log(rep_move);
        fs.readFile(fileDestination + sgfFileName.substring(0, sgfFileName.length - 4) + '_analyze.txt', 'utf8', async function (err, data_analyze) {
            rep_analyze = data_analyze;
            console.log(rep_analyze);

            let Black1stChoice = 0;
            let Black2ndChoice = 0;
            let BlackNot12Choice = 0;
            let BlackUnexpectedMoves = 0;

            let White1stChoice = 0;
            let White2ndChoice = 0;
            let WhiteNot12Choice = 0;
            let WhiteUnexpectedMoves = 0;

            let analyzes = rep_analyze.split("NN eval=");

            let moves = rep_move.split(";");
            let listOfMoves = new Array();
            for (let m = 2; m < moves.length; ++m) {

                let moveStr = moves[m];
                let positionFile = moveStr.substring(2, 4).includes("]") ? "pass" : moveStr.substring(2, 4);
                let alphaNormal = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's'];
                let alphaLeela = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T']; //pas de i !!!!

                let posLeela1 = "pass"
                let posLeela2 = 0;
                if (positionFile != "pass") {
                    posLeela1 = alphaLeela[alphaNormal.indexOf(positionFile.charAt(0))];
                    posLeela2 = 19 - alphaNormal.indexOf(positionFile.charAt(1));
                }
                //posLeela1 = String.fromCharCode(positionFile.charAt(0).charCodeAt(0)+1);
                let move =
                {
                    "colorShort": moveStr.substring(0, 1),
                    "colorLong": moveStr.substring(0, 1) == "W" ? "white" : "black",
                    "positionFile": positionFile,
                    "posLeela1": posLeela1,
                    "posLeela2": posLeela2,
                    "posLeela": posLeela1 == "pass" ? posLeela1 : posLeela1 + posLeela2,
                    "time": moveStr.substring(8, 10),
                }
                //console.log(move);
                listOfMoves.push(move);
            }
            //console.log(listOfMoves);
            console.log(analyzes.length);
            console.log(listOfMoves.length);
            let countMove = listOfMoves.length > 150 ? 150 : listOfMoves.length; //pour n'analyser que les 150 premiers coups

            for (let m = 0; m < countMove; ++m) {
                //console.log(analyzes);
                let analyzes2 = analyzes[listOfMoves.length - m].split("\r\n"); // "\n" : sur linux
                let analyzes3 = analyzes2[2].split("->");
                let analyze1 = {
                    "position": analyzes3[0].trim(),
                    "pourcent": analyzes3[1].substring(12, 18).trim(),
                }
                // let prop1 = analyzes3[0].trim();
                // let pourcent = analyzes3[1].substring(12,18);

                analyzes3 = analyzes2[3].split("->");
                let analyze2 = {
                    "position": analyzes3[0].trim(),
                    "pourcent": analyzes3[1].substring(12, 18).trim(),
                }
                // let prop2 = analyzes3[0].trim();
                let move = listOfMoves[m];
                console.log("prop1: " + analyze1.position);
                console.log("pourc1: " + analyze1.pourcent);
                console.log("prop2: " + analyze2.position);
                console.log("pourc2: " + analyze2.pourcent);
                console.log("move: " + move.posLeela);
                //console.log("dif pourcent: " + Math.abs(analyze1.pourcent - analyze2.pourcent));

                if (move.colorShort == "W") {
                    if (move.posLeela == analyze1.position) {
                        ++White1stChoice;
                    } else if (move.posLeela == analyze2.position && Math.abs(analyze1.pourcent - analyze2.pourcent) < 2.5) {
                        ++White2ndChoice;
                    } else {
                        ++WhiteNot12Choice;
                    }
                } else if (move.colorShort == "B") {
                    if (move.posLeela == analyze1.position) {
                        ++Black1stChoice;
                    } else if (move.posLeela == analyze2.position && Math.abs(analyze1.pourcent - analyze2.pourcent) < 2.5) {
                        ++Black2ndChoice;
                    } else {
                        ++BlackNot12Choice;
                    }
                } else {
                    console.error("prob");
                }

                //analyse que aucun coup ne correspond
                //let analyzes2 = analyzes[countMove - m].split("\r\n");
                let notMatch = true;
                for (let a = 2; a < analyzes2.length; ++a) {
                    let analyzes4 = analyzes2[a].split("->");
                    console.log(analyzes4);
                    if (analyzes4.length > 1) {
                        let analyze3 = {
                            "position": analyzes4[0].trim(),
                            "pourcent": analyzes4[1].substring(12, 18).trim()
                        }
                        if (move.posLeela == analyze3.position && Math.abs(analyze1.pourcent - analyze3.pourcent) < 5) {
                            notMatch = false;
                        }
                    }
                }
                if (notMatch) {
                    if (move.colorShort == "W") {
                        ++WhiteUnexpectedMoves;
                    } else if (move.colorShort == "B") {
                        ++BlackUnexpectedMoves;
                    }
                    console.log(m.toString());
                }
            }

            let BlackMatchRateOfMoves1And2 = ((Black1stChoice + Black2ndChoice) / (Black1stChoice + Black2ndChoice + BlackNot12Choice) * 100).toFixed(2);
            let BlackTotalAnalyzedMoves = Black1stChoice + Black2ndChoice + BlackNot12Choice;
            let IsBlackCheating = false;
            if ((BlackMatchRateOfMoves1And2 > 85 && blackLevel < 6) || BlackMatchRateOfMoves1And2 > (3, 324 * blackLevel + 58, 78)) {
                IsBlackCheating = true;
            }

            let WhiteMatchRateOfMoves1And2 = ((White1stChoice + White2ndChoice) / (White1stChoice + White2ndChoice + WhiteNot12Choice) * 100).toFixed(2);
            let WhiteTotalAnalyzedMoves = White1stChoice + White2ndChoice + WhiteNot12Choice;
            let IsWhiteCheating = false;
            if ((WhiteMatchRateOfMoves1And2 > 85 && whiteLevel < 6) || WhiteMatchRateOfMoves1And2 > (3, 324 * whiteLevel + 58, 78)) {
                IsWhiteCheating = true;
            }


            //--------------------------------------

            // console.log("Noir Corresp1: " + Black1stChoice.toString() + " Corresp2: " + Black2ndChoice.toString() + " Pas de corresp 1 et 2: " + BlackNot12Choice.toString() + " Unexpected: " + BlackUnexpectedMoves.toString() + ", taux :" + TauxCorrespBalck);
            // console.log("Blanc Corresp1: " + White1stChoice.toString() + " Corresp2: " + White2ndChoice.toString() + " Pas de corresp 1 et 2: " + WhiteNot12Choice.toString() + " Unexpected: " + WhiteUnexpectedMoves.toString() + ", taux :" + TauxCorrespWhite);

            let analyzedGame = {
                "BlackLevel": blackLevel,
                "Black1stChoice": Black1stChoice,
                "Black2ndChoice": Black2ndChoice,
                "BlackTotalAnalyzedMoves": BlackTotalAnalyzedMoves,
                "BlackUnexpectedMoves": BlackUnexpectedMoves,
                "BlackMatchRateOfMoves1And2": BlackMatchRateOfMoves1And2,
                "IsBlackCheating": IsBlackCheating,

                "WhiteLevel": whiteLevel,
                "White1stChoice": White1stChoice,
                "White2ndChoice": White2ndChoice,
                "WhiteTotalAnalyzedMoves": WhiteTotalAnalyzedMoves,
                "WhiteUnexpectedMoves": WhiteUnexpectedMoves,
                "WhiteMatchRateOfMoves1And2": WhiteMatchRateOfMoves1And2,
                "IsWhiteCheating": IsWhiteCheating,

                "SgfFileName": sgfFileName,
                "PlayerUserId": playerId,

            }
            console.log(analyzedGame);
        });
    });
}


function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


//module.exports = router;
//module.exports =  {  analyzeFileWithLeela, finalAnalyze };

module.exports = {
    router: router,
    testAnalyze: testAnalyze,
}