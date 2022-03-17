const express = require('express')
const router = express.Router();
const cors = require('cors')
const multer = require('multer')
const { validateToken } = require("../middlewares/AuthMiddleware");

let newFileName = "";
let originalFileName = "";
let fileDestination = "./SGFfiles/";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, fileDestination)
  },
  filename: (req, file, cb) => {
    originalFileName = file.originalname;
    newFileName = originalFileName.substring(0,file.originalname.length -4) + "_" + formatDate() + ".sgf";
    cb(null, newFileName)
  },
})

const upload = multer({ storage: storage })

router.post('/upload',validateToken, upload.single('file'), function (req, res) {
  //console.log(fileDestination + newFileName);

  res.json({newFileName : newFileName})
})

function formatDate() { //yyyy-mm-dd hh:mm:ss
  var dt = new Date();
  return(`${
      dt.getFullYear().toString().padStart(4, '0')}-${
      (dt.getMonth()+1).toString().padStart(2, '0')}-${
      dt.getDate().toString().padStart(2, '0')}_${
      dt.getHours().toString().padStart(2, '0')}.${
      dt.getMinutes().toString().padStart(2, '0')}.${
      dt.getSeconds().toString().padStart(2, '0')}`
  );
}

module.exports = router;