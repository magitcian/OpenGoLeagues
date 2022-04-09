const express = require('express')
const router = express.Router();
const cors = require('cors')
const multer = require('multer')
const { validateToken } = require("../middlewares/AuthMiddleware");
const { User, AnalyzedGame } = require("../models");

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

const upload = multer({ storage: storage })

router.post('/upload', validateToken, upload.single('file'), async function (req, res) {
  //console.log(fileDestination + newFileName);
  const { blackLevel, whiteLevel } = req.body;
  console.log(blackLevel);
  
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
    "PlayerUserId": req.user.id,
    "createdAt": fileDate,
    "Status": 0,

  }

  analyzedGame = await AnalyzedGame.create(analyzedGame);
  res.json({ analyzedGame: analyzedGame })
})


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
  console.log("fileid", FileId);
  const game = await AnalyzedGame.findOne({ where: { id: FileId, PlayerUserId: req.user.id, Status:1 } });
  if (game) {
    const fs = require('fs')
    const pathFileSGF = __dirname.substring(0, __dirname.length - 11) + "SGFfiles\\" + game.SgfFileName;
    const pathFileAnalysis = pathFileSGF.substring(0, pathFileSGF.length - 4) + "_analyze.txt";
    await AnalyzedGame.destroy({
      where: {
        id: FileId,
        PlayerUserId: req.user.id
      },
    });
    if (fs.existsSync(pathFileSGF)) {
      fs.unlinkSync(pathFileSGF);
      fs.unlinkSync(pathFileAnalysis);
      res.status(200).send({ message: "Files deleted" });
    } else {
      res.status(400).send({ error: "File doesn't exists!" });
    }
  } else {
    res.status(400).send({ error: "You are not allowed to delete this file!" });
  }
});

module.exports = router;