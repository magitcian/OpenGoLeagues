const express = require("express");
const router = express.Router();
const { validateToken } = require("../middlewares/AuthMiddleware");
const Sequelize = require('sequelize');

// On Windows Only :
router.get("/testOnWindows", validateToken, async (req, res) => {
    
    const { spawn } = require('child_process');
    const bat = spawn('../leelaZero/win/leela-zero-0.17-win64/leelaz.exe', ['-w', '..\\leelaZero\\win\\leela-zero-0.17-win64\\networks\\best-network', '-g', '-q']);
    
    let rep = "";
    await bat.stdout.on('data', (data) => {
        console.log("test1 " + data.toString());
        rep += data.toString();
    });

    //interact directly in the vs terminal :
    process.stdin.pipe(bat.stdin);

    await bat.stderr.on('data', (data) => {
        console.error("test2 " + data.toString());
        if (data.toString().includes("415 MiB.")) {
            // bat.stdin.write("list_commands \n");
            // bat.stdin.write("play b q16 \n");
            // bat.stdin.write("lz-analyze w \n");
            //bat.stdin.end();
        }
    });

    await bat.on('exit', (code) => {
        console.log(`Child exited with code ${code}`);
    });

    await bat.stdin.write("list_commands\n");

    await sleep(15000);
    res.json({ rep: rep });
});

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}


module.exports = router;
