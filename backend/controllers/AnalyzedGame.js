const express = require("express");
const router = express.Router();
const { AnalyzedGame } = require("../models");
const { validateToken } = require("../middlewares/AuthMiddleware");


router.get("/my-analyzed-games", validateToken, async (req, res) => {
    const listOfAnalyzedGame = await AnalyzedGame.findAll({
        where: { PlayerUserId: req.user.id },
    });
    res.json({ listOfAnalyzedGame: listOfAnalyzedGame });
});


module.exports = router;
