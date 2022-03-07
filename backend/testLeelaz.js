
async function leelaz() {

        // On Windows Only - interact directly in the terminal :
        const { spawn } = require('child_process');
        const bat = spawn('../leelaZero/win/leela-zero-0.17-win64/leelaz.exe', ['-w', '..\\leelaZero\\win\\leela-zero-0.17-win64\\networks\\best-network', '-g']);

        await bat.stdout.on('data', (data) => {
            console.log("testSev " + data.toString());
            if(data.toString().includes("Setting max tree size to 3736 MiB and cache size to 415 MiB.")){
                console.log("test2");
            }
        });

        process.stdin.pipe(bat.stdin);
    
        await bat.stderr.on('data', (data) => {
            console.error("testSev2 " +data.toString());
            if(data.toString().includes("415 MiB.")){
                // bat.stdin.write("list_commands \n");
                // bat.stdin.write("play b q16 \n");
                // bat.stdin.write("lz-analyze w \n");
                //bat.stdin.end();
            }
        });

    
        await bat.on('exit', (code) => {
            console.log(`Child exited with code ${code}`);
        });

        await bat.stdin.write("list_commands \n");

}


module.exports = { leelaz };

