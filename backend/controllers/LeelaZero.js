const express = require('express')
const router = express.Router();
const cors = require('cors')
const { User, AnalyzedGame } = require("../models");
const { validateToken } = require("../middlewares/AuthMiddleware");

let fileDestination = "./SGFfiles/";
let userID = 0;
router.post('/analyzed', validateToken, async function (req, res) {
    const { fileId } = req.body;
    const sgfFile = await AnalyzedGame.findOne({ where: { id: fileId, PlayerUserId: req.user.id } });
    if (sgfFile) {
        //console.log(sgfFile.SgfFileName);
        userID = sgfFile.PlayerUserId;
        analyzeFileWithLeela("w", sgfFile.SgfFileName);
        //leela.finalAnalyze(fileDestination + newFileName);
    }
    res.json({ rep: "in progress!" })
})


async function analyzeFileWithLeela(OStype, sgfFileName) {
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
                    finalAnalyze(sgfFileName);
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
        bat.stdin.write(i.toString() + " lz-setoption name visits value 100\n");
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

function finalAnalyze(sgfFileName) {
    const fs = require('fs');
    let rep_move = "";
    let rep_analyze = "";

    fs.readFile(fileDestination + sgfFileName, 'utf8', function (err, data_move) {
        rep_move = data_move;
        fs.readFile(fileDestination + sgfFileName.substring(0, sgfFileName.length - 4) + '_analyze.txt', 'utf8', async function (err, data_analyze) {
            rep_analyze = data_analyze;

            let CorrespNumOfMoves1White = 0;
            let CorrespNumOfMoves2White = 0;
            let NotCorrespNumOfMovesWhite = 0;
            let UnexpectedMovesWhite = 0;

            let CorrespNumOfMoves1Black = 0;
            let CorrespNumOfMoves2Black = 0;
            let NotCorrespNumOfMovesBlack = 0;
            let UnexpectedMovesBlack = 0;

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
                        ++CorrespNumOfMoves1White;
                    } else if (move.posLeela == analyze2.position && Math.abs(analyze1.pourcent - analyze2.pourcent) < 2.5) {
                        ++CorrespNumOfMoves2White;
                    } else {
                        ++NotCorrespNumOfMovesWhite;
                    }
                } else if (move.colorShort == "B") {
                    if (move.posLeela == analyze1.position) {
                        ++CorrespNumOfMoves1Black;
                    } else if (move.posLeela == analyze2.position && Math.abs(analyze1.pourcent - analyze2.pourcent) < 2.5) {
                        ++CorrespNumOfMoves2Black;
                    } else {
                        ++NotCorrespNumOfMovesBlack;
                    }
                } else {
                    console.error("prob");
                }

                //analyse que aucun coup ne correspond
                //let analyzes2 = analyzes[countMove - m].split("\r\n");
                let pasDeCorresp = true;
                for (let a = 2; a < analyzes2.length; ++a) {
                    let analyze3 = analyzes2[a].split("->");
                    let proposition = analyze3[0].trim();
                    if (move.posLeela == proposition) {
                        pasDeCorresp = false;
                    }
                }
                if (pasDeCorresp) {
                    if (move.colorShort == "W") {
                        ++UnexpectedMovesWhite;
                    } else if (move.colorShort == "B") {
                        ++UnexpectedMovesBlack;
                    }
                    console.log(m.toString());
                }
            }
            let TauxCorrespWhite = (CorrespNumOfMoves1White + CorrespNumOfMoves2White) / (CorrespNumOfMoves1White + CorrespNumOfMoves2White + NotCorrespNumOfMovesWhite) * 100;
            let TauxCorrespBalck = (CorrespNumOfMoves1Black + CorrespNumOfMoves2Black) / (CorrespNumOfMoves1Black + CorrespNumOfMoves2Black + NotCorrespNumOfMovesBlack) * 100;
            console.log("Blanc Corresp1: " + CorrespNumOfMoves1White.toString() + " Corresp2: " + CorrespNumOfMoves2White.toString() + " Pas de corresp 1 et 2: " + NotCorrespNumOfMovesWhite.toString() + " Unexpected: " + UnexpectedMovesWhite.toString() + ", taux :" + TauxCorrespWhite);
            console.log("Noir Corresp1: " + CorrespNumOfMoves1Black.toString() + " Corresp2: " + CorrespNumOfMoves2Black.toString() + " Pas de corresp 1 et 2: " + NotCorrespNumOfMovesBlack.toString() + " Unexpected: " + UnexpectedMovesBlack.toString() + ", taux :" + TauxCorrespBalck);

            let analyzedGame = {
                "CorrespNumOfMoves1White": CorrespNumOfMoves1White,
                "CorrespNumOfMoves2White": CorrespNumOfMoves2White,
                "TotalAnalyzedMovesWhite": CorrespNumOfMoves1White + CorrespNumOfMoves2White + NotCorrespNumOfMovesWhite,
                "UnexpectedMovesWhite": UnexpectedMovesWhite,

                "CorrespNumOfMoves1Black": CorrespNumOfMoves1Black,
                "CorrespNumOfMoves2Black": CorrespNumOfMoves2Black,
                "TotalAnalyzedMovesBlack": CorrespNumOfMoves1Black + CorrespNumOfMoves2Black + NotCorrespNumOfMovesBlack,
                "UnexpectedMovesBlack": UnexpectedMovesBlack,

                "SgfFileName": sgfFileName,
                "PlayerUserId": userID,

            }
            console.log(analyzedGame);
            await AnalyzedGame.create(analyzedGame);
        });
    });
};

//pour lancer à part dans le terminal backend/controllers: 
//node -e 'require("./LeelaZero").finalAnalyze("../SGFfiles/liusasori-pinenisan2_2022-03-15_22.37.49.sgf")'
//node -e 'require("./LeelaZero").testAnalyze()'
function testAnalyze() {

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