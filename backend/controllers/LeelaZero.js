const express = require("express");
const router = express.Router();
const { validateToken } = require("../middlewares/AuthMiddleware");
const Sequelize = require('sequelize');


// // On Windows Only :
// router.get("/testOnWindows", validateToken, (req, res) => {

//     const { spawn } = require('child_process');
//     const bat = spawn('../leelaZero/win/leela-zero-0.17-win64/leelaz.exe', ['-w', '..\\leelaZero\\win\\leela-zero-0.17-win64\\networks\\best-network', '-q']);

//     const fs = require('fs')
//     let last_move = "";
//     let last_gen = "";
//     let rep = "";
//     let rep1 = "";
//     let i = 0;
//     let j = 0;
//     bat.stdout.on('data', (data) => {
//         rep1 = data.toString();
//         rep += rep1;
//         j++;
//         if (rep1.includes("Leela:")) {
//             //rep2 = rep1;
//             // rep1 = data.toString();
//             // rep += rep1;
//             i++;
//             //rep += "_i:"+ i.toString() + "_j:" + j++;
//             console.log(i);
//             if (i == 1) {
//                 console.log("TEST1");
//                 bat.stdin.write("loadsgf ./SGFfiles/liusasori.sgf" + String.fromCharCode(10));
//             } else if (i == 2) {
//                 console.log("TEST2");
//                 bat.stdin.write("lz-setoption name visits value 2 " + String.fromCharCode(10)); //valeur idéal en prod: 1000
//             } else if (i == 3) {
//                 //move_history += rep1;
//                 console.log("TEST3");
//                 bat.stdin.write("move_history " + String.fromCharCode(10));
//             } else if (rep.includes("cannot undo")) {
//                 //console.log("test_move_history " + move_history);
//                 //console.log("test_genmove " + genmove);
//                 //console.log("test_rep :  " + rep);
//                 let test = rep.replace("Leela:", "test");
//                 console.log(test);
//                 fs.writeFile('./SGFfiles/log.txt', rep, err => {
//                     if (err) {
//                         console.error(err)
//                         return
//                     }
//                     //file written successfully
//                 })
//                 bat.kill();
//             } else if ((i) % 4 == 0) {
//                 //rep += "_COM1_";
//                 //rep += "COM1_" + i.toString() + data.toString();
//                 //console.log("TEST_%1");
//                 bat.stdin.write("last_move " + String.fromCharCode(10));
//             } else if ((i - 1) % 4 == 0) {
//                 //last_move = rep1;
//                 //rep += "_COM2_last_move_" + last_move + "_" + j.toString();
//                 // rep += "COM2_" + i.toString() + data.toString();
//                 // console.log("TEST_%2");
//                 bat.stdin.write("undo " + String.fromCharCode(10));
//             } else if ((i - 2) % 4 == 0) {
//                 //rep += "_COM3_";
//                 //rep += "COM3_" + i.toString() + data.toString();
//                 last_move = rep.substring(rep.length - 35);
//                 if (last_move.includes("black")) {
//                     //console.log("TEST_%3_black");
//                     rep += "_black ";
//                     bat.stdin.write("genmove b " + String.fromCharCode(10));
//                 } else {
//                     //console.log("TEST_%3_white");
//                     rep += "_white ";
//                     bat.stdin.write("genmove w " + String.fromCharCode(10));
//                 }
//             } else if ((i - 3) % 4 == 0) {
//                 //rep += "_COM4_";
//                 last_gen = rep.substring(rep.length - 35);
//                 // rep += "COM4_" + i.toString() + data.toString();
//                 // console.log("TEST_%4 : last_gen " + data.toString());
//                 if (last_gen.includes("resign")) {
//                     bat.stdin.write(String.fromCharCode(10));
//                 } else {
//                     bat.stdin.write("undo " + String.fromCharCode(10));
//                 }

//             }

//             // bat.stdin.write("play b q16 \n");
//             // bat.stdin.write("lz-analyze w \n");
//             //bat.stdin.end();
//             //rep += data.toString();
//         } else {
//             //console.log(data.toString());
//             //genmove += data.toString();
//             //rep += data.toString();
//         }

//     });

//     //interact directly in the vs terminal :
//     //process.stdin.pipe(bat.stdin);

//     bat.stderr.on('data', (data) => {
//         console.error("data2 " + data.toString());
//     });

//     bat.on('exit', (code) => {
//         console.log(`Child exited with code ${code}`);
//     });

//     //await sleep(15000);
//     res.json({ rep: rep });
// });


router.get("/generateAnalyzeOnWindows", validateToken, async (req, res) => {

    const { spawn } = require('child_process');
    const bat = spawn('../leelaZero/win/leela-zero-0.17-win64/leelaz.exe', ['-w', '..\\leelaZero\\win\\leela-zero-0.17-win64\\networks\\best-network', '-g', '--lagbuffer', '0']);

    const fs = require('fs')
    let rep = "";
    let fini = false;

    let i = 0;
    let rep_move = "";
    let rep_analyze = "";
    //utiliser 2 variables différentes pour stdout (pour le move_history) et stderr (pour les analyses). 
    //puis faire un split sur chacune des 2 variables
    //analyser ces 2 variables avec une fonction qui s'exécute à la fin de l'analyse par leela-zero

    bat.stdout.on('data', async (data) => {
        rep_move += data.toString();
        // rep1 = data.toString();
        console.log(data.toString());
        if (rep_move.includes("cannot undo")) {
            fini = true;
            fs.writeFile('./SGFfiles/log_rep.txt', rep_move, err => {
                if (err) {
                    console.error(err)
                    return
                }
            })
            fs.writeFile('./SGFfiles/log_analyze.txt', rep_analyze, err => {
                if (err) {
                    console.error(err)
                    return
                }
            })
            console.log("finish!");
            bat.kill();
        }
    });

    bat.stderr.on('data', (data) => {
        rep_analyze += data.toString();
    });


    bat.stdin.write("1 loadsgf ./SGFfiles/34485608-206-EdIV-dartagaluc.sgf \n");
    await sleep(2000);
    bat.stdin.write("2 lz-setoption name visits value 1000 \n");
    await sleep(500);
    bat.stdin.write("3 move_history \n");
    await sleep(500);
    i = 3;
    while (!fini) {
        console.log(i++);
        // bat.stdin.write(i.toString() + " last_move \n");
        // await sleep(500);
        bat.stdin.write(i.toString() + " undo \n");
        await sleep(500);
        bat.stdin.write(i.toString() + " lz-analyze \n");
        await sleep(1000);
    }

    bat.on('exit', (code) => {
        console.log(`Child exited with code ${code}`);
    });

    res.json({ rep: rep });
});

router.get("/generateAnalyzeOnLinux", validateToken, async (req, res) => {

    // list_commands= 
    // protocol_version
    // name
    // version
    // quit
    // known_command
    // list_commands
    // boardsize
    // clear_board
    // komi
    // play
    // genmove
    // showboard
    // undo
    // final_score
    // final_status_list
    // time_settings
    // time_left
    // fixed_handicap
    // place_free_handicap
    // set_free_handicap
    // loadsgf
    // printsgf
    // kgs-genmove_cleanup
    // kgs-time_settings
    // kgs-game_over
    // heatmap
    // lz-analyze
    // lz-genmove_analyze

    //utilisation de lz-analyze: "lz-analyze 1 b"
    
    const { spawn } = require('child_process');
    const bat = spawn('../leelaZero/linux/leela-zero/build/leelaz', ['-w', '../leelaZero/win/leela-zero-0.17-win64/networks/best-network', '-g', '--lagbuffer', '0']);

    const fs = require('fs')
    let rep = "";
    let fini = false;

    let i = 0;
    let rep_move = "";
    let rep_analyze = "";
    //utiliser 2 variables différentes pour stdout (pour le move_history) et stderr (pour les analyses). 
    //puis faire un split sur chacune des 2 variables
    //analyser ces 2 variables avec une fonction qui s'exécute à la fin de l'analyse par leela-zero

    bat.stdout.on('data', async (data) => {
        rep_move += data.toString();
        // rep1 = data.toString();
        console.log(data.toString());
        if (rep_move.includes("cannot undo")) {
            fini = true;
            fs.writeFile('./SGFfiles/log_rep.txt', rep_move, err => {
                if (err) {
                    console.error(err)
                    return
                }
            })
            fs.writeFile('./SGFfiles/log_analyze.txt', rep_analyze, err => {
                if (err) {
                    console.error(err)
                    return
                }
            })
            console.log("finish!");
            bat.kill();
        }
    });

    bat.stderr.on('data', (data) => {
        rep_analyze += data.toString();
    });


    bat.stdin.write("1 loadsgf ./SGFfiles/34485608-206-EdIV-dartagaluc.sgf \n");
    await sleep(2000);
    // bat.stdin.write("2 lz-setoption name visits value 1000 \n");
    // await sleep(500);
    // bat.stdin.write("3 move_history \n");
    // await sleep(500);
    i = 3;
    let str = "b";
    while (!fini) {
        console.log(i++);
        // bat.stdin.write(i.toString() + " last_move \n");
        // await sleep(500);
        bat.stdin.write(i.toString() + " undo \n");
        await sleep(500);
        bat.stdin.write(i.toString() + " lz-analyze 0 \n");
        await sleep(2000);
    }

    bat.on('exit', (code) => {
        console.log(`Child exited with code ${code}`);
    });


    res.json({ rep: rep });
});



router.get("/analyzeFile", validateToken, async (req, res) => {
    const fs = require('fs');
    let rep_move = "";
    let rep_analyze = "";

    fs.readFile('./SGFfiles/log_rep.txt', 'utf8', function(err, data_move) {
        rep_move = data_move;
        fs.readFile('./SGFfiles/log_analyze.txt', 'utf8', function(err, data_analyze) {
            rep_analyze = data_analyze;

            let countCorrespond1White = 0;
            let countCorrespond2White = 0;
            let countCorrespPasWhite = 0;

            let countCorrespond1Black = 0;
            let countCorrespond2Black = 0;
            let countCorrespPasBlack = 0;
            let analyzes = rep_analyze.split("NN eval=");
            console.log(analyzes[3]);

            let moves = rep_move.split("=");
            console.log(moves[3].trim());
            let moves2 = moves[3].trim();
            let moves3 = moves2.split("\r\n");
            for(let m = 0; m< moves3.length -2; ++m){
                //console.log(analyzes);
                let analyzes2 = analyzes[m+1].split("\r\n");
                let props = analyzes2[2].split("->");
                let prop1 = props[0].trim();
                props = analyzes2[3].split("->");
                let prop2 = props[0].trim();
                let move = moves3[m].split(" ");
                console.log("prop1: " + prop1);
                console.log("prop2: " + prop2);
                console.log("move: " + move[1].trim());
                if(move[0] == "white"){
                    if(move[1].trim() == prop1){
                        ++countCorrespond1White;
                    }else if(move[1].trim() == prop2){
                        ++countCorrespond2White;
                    }else{
                        ++countCorrespPasWhite;
                    }
                }else if(move[0] == "black"){
                    if(move[1].trim() == prop1){
                        ++countCorrespond1Black;
                    }else if(move[1].trim() == prop2){
                        ++countCorrespond2Black;
                    }else{
                        ++countCorrespPasBlack;
                    }
                }else{
                    console.error("prob");
                }
            }
            let TauxCorrespWhite = (countCorrespond1White + countCorrespond2White) / (countCorrespond1White + countCorrespond2White + countCorrespPasWhite) *100;
            let TauxCorrespBalck = (countCorrespond1Black + countCorrespond2Black)/ (countCorrespond1Black + countCorrespond2Black + countCorrespPasBlack) *100;
            console.log("Blanc Corresp1: " + countCorrespond1White.toString() + " Corresp2: " + countCorrespond2White.toString() + " Correspond pas: " + countCorrespPasWhite.toString()+ ", taux :" + TauxCorrespWhite);
            console.log("Noir Corresp1: " + countCorrespond1Black.toString() + " Corresp2: " + countCorrespond2Black.toString() + " Correspond pas: " + countCorrespPasBlack.toString() + ", taux :" + TauxCorrespBalck);

          });
      });

    res.json({ rep: "rep" });
});



function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

module.exports = router;
