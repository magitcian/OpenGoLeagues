//Command : node index.js
const prompt = require('prompt-sync')();
const leelaAnalyzer = require("../controllers/LeelaZero");
const sgfAnalyzer = require("../controllers/SGFfile");
const statistics = require("./functionsGoStatistics");
const fs = require('fs');
const fsp = require('fs').promises;
let listOfFiles = [];


//deleteAllStatisticalData();
launch();

async function launch() {
  let nodePath = prompt('Which folder to analyse ?'); // D:\TempWork\testLeela\parties
  //let nodePath = "D:/TempWork/testLeela/parties/PetGo";
  if (fs.existsSync(nodePath)) {
    const path = require('path').dirname(nodePath);
    const nodeName = nodePath.substring(path.length + 1);
    await getAllFiles(path, nodeName);
    launchAnalysisOnFiles();
  }
}

async function getAllFiles(nodePath, nodeName) {
  let node = nodePath + "/" + nodeName;
  //console.log(node);
  if (fs.lstatSync(node).isFile()) {
    nodeName = await removeBlanksInFileName(nodePath, nodeName);
    console.log(nodeName);
    let file = {
      "Path": nodePath + "/",
      "SgfFileName": nodeName,
      "AnalyzedGames": [],
      "TM": "",
      "OT": "",
    };
    listOfFiles.push(file);
  } else {
    let nodes = fs.readdirSync(node);
    nodes.forEach(async (n) => {
      getAllFiles(node, n);
    })
  }
  return 0;
}

async function launchAnalysisOnFiles() {
  //let listOfAverage = [100, 500, 1000];
  for (const f of listOfFiles) {
    // for (i = 0; i < 3; ++i) {
    //   f.VisitsAverage = listOfAverage[i];
    //   //f.VisitsAverage = 100;
    //   f.ForStatistics = true;
    //   //console.log(f);
    //   await analyseSGFfile(f);
    // }
    f.ForStatistics = true;
    f.VisitsAverage = 1000;
    await analyseSGFfile(f);
  }
}

async function removeBlanksInFileName(filePath, fileName) {
  if (fileName.includes(" ")) {
    let fileNameWithoutBlank = fileName.replace(/\s/g, '');
    await fsp.rename(filePath + "/" + fileName, filePath + "/" + fileNameWithoutBlank, function (err) {
      if (err) console.log('ERROR: ' + err);
    });
    return fileNameWithoutBlank;
  }
  return fileName;
}

async function analyseSGFfile(f) {
  let game = await sgfAnalyzer.getGameInfoFromSGFfile(f.Path + f.SgfFileName);
  if (game.BR && game.WR) {
    //rename analysis file with VisitsAverage:
    aFileName = f.Path + f.SgfFileName.substring(0, f.SgfFileName.length - 4) + '_analyze.txt';
    aFileNameNew = f.Path + f.SgfFileName.substring(0, f.SgfFileName.length - 4) + "_" + f.VisitsAverage + '_analyze.txt';

    if (!fs.existsSync(aFileNameNew)) {
      await leelaAnalyzer.createAnalysisFileWithLeela(f.Path, f);
      await fsp.rename(aFileName, aFileNameNew, function (err) {
        if (err) console.log('ERROR: ' + err);
      });

      let listOfLeelazMoves = await leelaAnalyzer.getProposedMovesFromAnalysisFile(aFileNameNew);
      let statGame = leelaAnalyzer.getAnalyzedGame(f, game.Moves, listOfLeelazMoves);
      statGame.TM = game.TM;
      statGame.OT = game.OT;
      statGame.Path = f.Path;
      statGame.AnalyzedGames.forEach(moves => {
        if (moves.Color == "b") {
          moves.Level = game.BR;
        } else {
          moves.Level = game.WR;
        }
      })
      await statistics.addData(statGame);

    }
  } else {
    console.log("No level found in file!")
  }
}

function deleteAllStatisticalData() {
  statistics.deleteAllData();
}

