const express = require('express')
const router = express.Router();
const cors = require('cors')
const multer = require('multer')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'SGFfiles/')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})

const upload = multer({ storage: storage })

router.post('/upload', upload.single('file'), function (req, res) {
  res.json({})
})

module.exports = router;