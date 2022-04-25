
  function deleteAllData() {
    const sqlite3 = require('sqlite3').verbose();

    let db = new sqlite3.Database('./Data/GoStatistics.db', (err) => {
        if (err) {
            console.error(err.message);
        }
    });

    db.run(`DELETE FROM Statistics`, function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Row(s) Statistics deleted ${this.changes}`);
    });

    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
    });
    return 0;
}

function getDate() { //yyyy-mm-dd hh:mm:ss
    var dt = new Date();
    return (`${dt.getFullYear().toString().padStart(4, '0')}-${(dt.getMonth() + 1).toString().padStart(2, '0')}-${dt.getDate().toString().padStart(2, '0')} ${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}`
    );
  }

function addData(stat) {

    const sqlite3 = require('sqlite3').verbose();

    let db = new sqlite3.Database('./Data/GoStatistics.db', (err) => {
        if (err) {
            console.error(err.message);
        }
    });

    let sqlStat = "INSERT INTO Statistics(SgfFileName, Path, VisitsAverage, BlackLevel, Black1stChoice, Black2ndChoice, BlackTotalAnalyzedMoves, BlackUnexpectedMoves, BlackMatchRateOfMoves1And2, WhiteLevel, White1stChoice, White2ndChoice, WhiteTotalAnalyzedMoves, WhiteUnexpectedMoves, WhiteMatchRateOfMoves1And2, createdAt, updatedAt) VALUES ";
    sqlStat += "( '" + stat.SgfFileName + "', '" + stat.Path + "', '" + stat.VisitsAverage + "', '" + stat.BlackLevel + "', " + stat.Black1stChoice + ", " + stat.Black2ndChoice + ", " + stat.BlackTotalAnalyzedMoves + ", " + stat.BlackUnexpectedMoves + ", " + stat.BlackMatchRateOfMoves1And2 + ", '" + stat.WhiteLevel + "', " + stat.White1stChoice + ", " + stat.White2ndChoice + ", " + stat.WhiteTotalAnalyzedMoves + ", " + stat.WhiteUnexpectedMoves + ", " + stat.WhiteMatchRateOfMoves1And2 + ",'" + getDate() + "', '" + getDate() + "')";

    console.log(sqlStat);
    db.run(sqlStat, function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Rows Statistic inserted ${this.changes}`);
    });

    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
    });

    return 0;
}

module.exports = { deleteAllData, addData };