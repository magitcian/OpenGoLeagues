const express = require('express')
const router = express.Router();
const cors = require('cors')
const multer = require('multer')
const { validateToken } = require("../middlewares/AuthMiddleware");
const { User, AnalyzedGame, Level } = require("../models");

let newFileName = "";
let fileDate;
let originalFileName = "";
let fileDestination = "./SGFfiles/";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, fileDestination)
  },
  filename: (req, file, cb) => {
    originalFileName = file.originalname;
    fileDate = new Date();
    newFileName = originalFileName.substring(0, file.originalname.length - 4) + "_" + formatDate() + ".sgf";
    cb(null, newFileName)
  },
})

function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /txt|sgf/;
  const path = require("path");
  // Check ext
  const extname = filetypes.test(
    path.extname(file.originalname).toString()
  );
  if (extname) {
    return cb(null, true);
  } else {
    cb("Error: File sgf only!");
  }
}

const multerUploads = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("file");

router.post('/upload', validateToken, multerUploads, async function (req, res) {
  const { blackLevel, whiteLevel, visits } = req.body;
  const blackPlayerLevel = await Level.findOne({ where: { levelNumber: blackLevel } });
  const whitePlayerLevel = await Level.findOne({ where: { levelNumber: whiteLevel } });
  let isFileFormatCorrect = await correctFileFormat(fileDestination + newFileName);
  if (visits <= 1000 && blackPlayerLevel && whitePlayerLevel && isFileFormatCorrect) {

    let analyzedGame = {
      "BlackLevel": blackLevel,
      "Black1stChoice": 0,
      "Black2ndChoice": 0,
      "BlackTotalAnalyzedMoves": 0,
      "BlackUnexpectedMoves": 0,
      "BlackMatchRateOfMoves1And2": 0,
      "IsBlackCheating": false,

      "WhiteLevel": whiteLevel,
      "White1stChoice": 0,
      "White2ndChoice": 0,
      "WhiteTotalAnalyzedMoves": 0,
      "WhiteUnexpectedMoves": 0,
      "WhiteMatchRateOfMoves1And2": 0,
      "IsWhiteCheating": false,

      "SgfFileName": newFileName,
      "VisitsAverage" : visits,
      "PlayerUserId": req.user.id,
      "createdAt": fileDate,
      "Status": 0,
    }
    analyzedGame = await AnalyzedGame.create(analyzedGame);
    res.json({ analyzedGame: analyzedGame });
  } else {
    const fs = require('fs');
    fs.unlinkSync(fileDestination + newFileName); //delete file
    res.json({ error: "Bad file format or wrong information provided!" });
  }
})

const upload = multer({ storage: storage })
router.post('/download', validateToken, upload.none(), async function (req, res) {
  const { fileId } = req.body;
  const sgfFile = await AnalyzedGame.findOne({ where: { id: fileId, PlayerUserId: req.user.id } });
  if (sgfFile) {
    const fs = require('fs')
    const pathFile = __dirname.substring(0, __dirname.length - 11) + "SGFfiles\\" + sgfFile.SgfFileName;
    if (fs.existsSync(pathFile)) { 
      res.append('fileName', sgfFile.SgfFileName); 
      res.status(200).sendFile(pathFile);
    } else {
      res.status(400).send({ error: "File doesn't exists!" });
    }
  } else {
    res.status(400).send({ error: "You are not allowed to obtain this file!" });
  }
})

function formatDate() { //yyyy-mm-dd_hh.mm.ss.ms  
  var dt = fileDate;
  return (`${dt.getFullYear().toString().padStart(4, '0')}-${(dt.getMonth() + 1).toString().padStart(2, '0')}-${dt.getDate().toString().padStart(2, '0')}_${dt.getHours().toString().padStart(2, '0')}.${dt.getMinutes().toString().padStart(2, '0')}.${dt.getSeconds().toString().padStart(2, '0')}.${dt.getMilliseconds().toString().padStart(3, '0')}`
  );
}
//other possible format : yyyy-mm-dd hh:mm:ss

router.delete("/delete/:fileId", validateToken, async (req, res) => {
  const FileId = req.params.fileId;
  const game = await AnalyzedGame.findOne({ where: { id: FileId, PlayerUserId: req.user.id, Status: 1 } });
  if (game) {
    const fs = require('fs');
    const pathFileSGF = __dirname.substring(0, __dirname.length - 11) + "SGFfiles\\" + game.SgfFileName;
    const pathFileAnalysis = pathFileSGF.substring(0, pathFileSGF.length - 4) + "_analyze.txt";
    await AnalyzedGame.destroy({
      where: {
        id: FileId,
        PlayerUserId: req.user.id
      },
    });
    if (fs.existsSync(pathFileSGF)) { //if file exist then delete files
      fs.unlinkSync(pathFileSGF);
      fs.unlinkSync(pathFileAnalysis);
      res.json({ message: "Files deleted" });
    } else {
      res.json({ error: "File doesn't exists!" });
    }
  } else {
    res.json({ error: "You are not allowed to delete this file!" });
  }
});

async function correctFileFormat(filePath) {
  try {
    let moves = await getMovesFromFile(filePath);
    if (moves.length !== 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    //console.error(error);
    return false;
  }
}

async function getMovesFromFile(filePath) {
  let arrayOfMovesObj = new Array();
  let movesBin = await loadFileContent(filePath);
  let movesStr = movesBin.toString();
  let arrayOfMovesStr = movesStr.split(";");

  for (let i = 2; i < arrayOfMovesStr.length; ++i) {
    let moveStr = arrayOfMovesStr[i];
    if (moveStr.includes("[") && moveStr.includes("]")) {
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
      let moveObj =
      {
        "colorShort": moveStr.substring(0, 1),
        "colorLong": moveStr.substring(0, 1) == "W" ? "white" : "black",
        "positionFile": positionFile,
        "posLeela1": posLeela1,
        "posLeela2": posLeela2,
        "posLeela": posLeela1 == "pass" ? posLeela1 : posLeela1 + posLeela2,
        "time": moveStr.substring(8, 10),
      }
      //console.log(moveObj);
      if ((moveObj.colorShort === "W" || moveObj.colorShort === "B") && moveObj.posLeela1 !== undefined) {
        arrayOfMovesObj.push(moveObj);
      }
    }
  }
  return arrayOfMovesObj;
}

async function loadFileContent(filePath) {
  const fs = require('fs').promises;
  const data = await fs.readFile(filePath, "binary");
  return new Buffer.from(data);
}

//module.exports = router;

module.exports = {
  router: router,
  getMovesFromFile: getMovesFromFile,
}