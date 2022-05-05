
const sqlite3 = require('sqlite3').verbose();
let db;
let dataDate = getDate();

function getDate() { //yyyy-mm-dd hh:mm:ss
    var dt = new Date();
    return (`${dt.getFullYear().toString().padStart(4, '0')}-${(dt.getMonth() + 1).toString().padStart(2, '0')}-${dt.getDate().toString().padStart(2, '0')} ${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}`
    );
}

function openDB() {
    return new Promise(async (resolve, reject) => {
        db = new sqlite3.Database('./Data/GoStatistics.db', (err) => {
            if (err) {
                console.error(err.message);
                reject("FAILURE");
            }
            console.log(`Rows Statistic inserted ${this.changes}`);
            resolve("SUCCESS");
        });
    })
}

function closeDB() {
    return new Promise(async (resolve, reject) => {
        db.close((err) => {
            if (err) {
                console.error(err.message);
                reject("FAILURE");
            }
            console.log(`Rows Statistic inserted ${this.changes}`);
            resolve("SUCCESS");
        });
    })
}

async function deleteAllData() {

    await openDB();

    db.run(`DELETE FROM StatGame`, function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Row(s) StatGame deleted ${this.changes}`);
    });

    db.run(`DELETE FROM StatSGFfile`, function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Row(s) StatSGFfile deleted ${this.changes}`);
    });

    await closeDB();
}

async function addData(stat) {
    dataDate = getDate();
    await openDB();
    await insertSGFfile(stat);
    stat.SGFfileId = await getSGFfileId(stat);
    await insertStatGames(stat);
    await closeDB();
}

function insertSGFfile(stat) {
    return new Promise(async (resolve, reject) => {
        let sqlSGF = "INSERT INTO StatSGFfile(SgfFileName, Path, VisitsAverage, TM, OT, createdAt, updatedAt) VALUES ";
        sqlSGF += "( '" + stat.SgfFileName + "', '" + stat.Path + "', '" + stat.VisitsAverage + "', '" + stat.TM + "', '" + stat.OT + "', '" + dataDate + "', '" + dataDate + "');";
        console.log(sqlSGF);
        db.run(sqlSGF, function (err) {
            if (err) {
                console.error(err.message);
                reject("FAILURE");
            }
            console.log(`Rows Statistic inserted ${this.changes}`);
            resolve("SUCCESS");
        });
    })
}

function getSGFfileId(stat) {
    return new Promise(async (resolve, reject) => {
        db.each("select seq from sqlite_sequence where name='StatSGFfile';", function (err, row) {
            if (err) {
                console.error(err.message);
                reject("FAILURE");
            }
            resolve(row.seq);
        });
    })
}

function insertStatGames(stat) {
    return new Promise(async (resolve, reject) => {
        let sqlGame = "INSERT INTO StatGame(SGFfileId, Color, Level, `1stChoice`, `2ndChoice`, TotalAnalyzedMoves, UnexpectedMoves, createdAt, updatedAt) VALUES ";

        stat.AnalyzedGames.forEach(game => {
            sqlGame += "( " + stat.SGFfileId + ", '" + game.Color + "', '" + game.Level + "', '" + game["1stChoice"] + "', '" + game["2ndChoice"] + "', '" + game.TotalAnalyzedMoves + "', '" + game.UnexpectedMoves + "', '" + dataDate + "', '" + dataDate + "'),";
        })
        sqlGame = sqlGame.substring(0, sqlGame.length - 1) + ";";
        console.log(sqlGame);

        db.run(sqlGame, function (err) {
            if (err) {
                console.error(err.message);
                reject("FAILURE");
            }
            resolve("SUCCESS");
            console.log(`Rows StatGame inserted ${this.changes}`);
        });
    })
}

module.exports = { deleteAllData, addData };