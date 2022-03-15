async function analyzeFileWithLeela(OStype, sgfPath) {
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
            fs.writeFile(sgfPath.substring(0,sgfPath.length -4) + '_analyze.txt', rep_analyze, err => {
                if (err) {
                    console.error(err)
                    return
                }else{
                    finalAnalyze(sgfPath);
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
    bat.stdin.write(i.toString() + " loadsgf " + sgfPath + "\n");
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
        await sleep(5000);
    }


    bat.on('exit', (code) => {
        console.log(`Child exited with code ${code}`);
    });
}

//pour lancer à part dans le terminal backend/controllers: 
//node -e 'require("./LeelaZero").finalAnalyze("../SGFfiles/liusasori-pinenisan2_2022-03-15_22.37.49.sgf")'

function finalAnalyze(sgfPath) {
    const fs = require('fs');
    let rep_move = "";
    let rep_analyze = "";

    fs.readFile(sgfPath, 'utf8', function (err, data_move) {
        rep_move = data_move;
        fs.readFile(sgfPath.substring(0,sgfPath.length -4) + '_analyze.txt', 'utf8', function (err, data_analyze) {
            rep_analyze = data_analyze;

            let countCorrespond1White = 0;
            let countCorrespond2White = 0;
            let countCorrespPasWhite = 0;
            let countAucuneCorrespWhite = 0;

            let countCorrespond1Black = 0;
            let countCorrespond2Black = 0;
            let countCorrespPasBlack = 0;
            let countAucuneCorrespBlack = 0;

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
                let analyze1 ={
                    "position":analyzes3[0].trim(),
                    "pourcent":analyzes3[1].substring(12,18).trim(),
                }
                // let prop1 = analyzes3[0].trim();
                // let pourcent = analyzes3[1].substring(12,18);
                
                analyzes3 = analyzes2[3].split("->");
                let analyze2 ={
                    "position":analyzes3[0].trim(),
                    "pourcent":analyzes3[1].substring(12,18).trim(),
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
                        ++countCorrespond1White;
                    } else if (move.posLeela == analyze2.position && Math.abs(analyze1.pourcent - analyze2.pourcent) < 2.5) {
                        ++countCorrespond2White;
                    } else {
                        ++countCorrespPasWhite;
                    }
                } else if (move.colorShort == "B") {
                    if (move.posLeela == analyze1.position) {
                        ++countCorrespond1Black;
                    } else if (move.posLeela == analyze2.position && Math.abs(analyze1.pourcent - analyze2.pourcent) < 2.5) {
                        ++countCorrespond2Black;
                    } else {
                        ++countCorrespPasBlack;
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
                if(pasDeCorresp){
                    if (move.colorShort == "W") {
                        ++countAucuneCorrespWhite;
                    } else if (move.colorShort == "B") {
                        ++countAucuneCorrespBlack;
                    }
                    console.log(m.toString());
                }
            }
            let TauxCorrespWhite = (countCorrespond1White + countCorrespond2White) / (countCorrespond1White + countCorrespond2White + countCorrespPasWhite) * 100;
            let TauxCorrespBalck = (countCorrespond1Black + countCorrespond2Black) / (countCorrespond1Black + countCorrespond2Black + countCorrespPasBlack) * 100;
            console.log("Blanc Corresp1: " + countCorrespond1White.toString() + " Corresp2: " + countCorrespond2White.toString() + " Pas de corresp 1 et 2: " + countCorrespPasWhite.toString() + " Unexpected: " + countAucuneCorrespWhite.toString() + ", taux :" + TauxCorrespWhite);
            console.log("Noir Corresp1: " + countCorrespond1Black.toString() + " Corresp2: " + countCorrespond2Black.toString() + " Pas de corresp 1 et 2: " + countCorrespPasBlack.toString() + " Unexpected: " + countAucuneCorrespBlack.toString() + ", taux :" + TauxCorrespBalck);

        });
    });
};



function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

module.exports = { analyzeFileWithLeela, finalAnalyze };
