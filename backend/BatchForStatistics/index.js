//Command : node index.js
const prompt = require('prompt-sync')();
const leelaAnalyzer = require("../controllers/LeelaZero");
const sgfAnalyzer = require("../controllers/SGFfile");
const statistics = require("./changeStatistics");
const fs = require('fs');

const test = "dgfsdgq";
let listOfFiles = [];

//let nodePath = prompt('Which folder to analyse ?'); //D:\TempWork\testLeela\parties
let nodePath = "D:/TempWork/testLeela/parties";
//statistics.deleteAllData();
if (fs.existsSync(nodePath)) {
  const path = require('path').dirname(nodePath);
  const nodeName = nodePath.substring(path.length + 1);
  getAllFiles(path, nodeName);
  launchAnalysisOnFiles();
}

function getAllFiles(nodePath, nodeName) {
  let node = nodePath + "/" + nodeName;
  console.log(node);
  if (fs.lstatSync(node).isFile()) {
    let file = {
      "Path": nodePath + "/",
      "SgfFileName": nodeName,
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
  listOfAverage = [100, 500, 1000];
  for (const f of listOfFiles) {
    for (i = 0; i < 3; ++i) {
      f.VisitsAverage = listOfAverage[i];
      f.ForStatistics = true;
      console.log(f);
      await analyseSGFfile(f);
    }
  }
}

async function analyseSGFfile(f) {
  let levels = await getLevelsFromSGFfile(f);
  if (levels) {
    //rename analysis file with VisitsAverage:
    aFileName = f.Path + f.SgfFileName.substring(0, f.SgfFileName.length - 4) + '_analyze.txt';
    aFileNameNew = f.Path + f.SgfFileName.substring(0, f.SgfFileName.length - 4) + "_" + f.VisitsAverage + '_analyze.txt';
    if (!fs.existsSync(aFileNameNew)) {
      await leelaAnalyzer.createAnalysisFileWithLeela(f.Path, f);
      fs.rename(aFileName, aFileNameNew, function (err) {
        if (err) console.log('ERROR: ' + err);
      });
      let listOfMoves = await sgfAnalyzer.getMovesFromFile(f.Path + f.SgfFileName);
      let listOfLeelazMoves = await leelaAnalyzer.getProposedMovesFromAnalysisFile(aFileNameNew);
      let statGame = leelaAnalyzer.getAnalyzedGame(f, listOfMoves, listOfLeelazMoves);
      statGame.Path = f.Path;
      statGame.BlackLevel = levels.black;
      statGame.WhiteLevel = levels.white;
      statistics.addData(statGame);
    }
  } else {
    console.log("No level found in file!")
  }
}

async function getLevelsFromSGFfile(f) {
  let containtBin = await loadFileContent(f.Path + f.SgfFileName);
  let containtStr = containtBin.toString();
  let arrayOfinfo = containtStr.split(";");
  if (arrayOfinfo && arrayOfinfo[1] && arrayOfinfo[1].includes("BR[") && arrayOfinfo[1].includes("WR[")) {
    let br = arrayOfinfo[1].split("BR[");
    let wr = arrayOfinfo[1].split("WR[");
    let levels = {
      "black": br[1].split("]")[0].toString(),
      "white": wr[1].split("]")[0].toString(),
    }
    return levels;
  } else {
    return undefined;
  }
}

async function loadFileContent(filePath) {
  const fs = require('fs').promises;
  const data = await fs.readFile(filePath, "binary");
  return new Buffer.from(data);
}