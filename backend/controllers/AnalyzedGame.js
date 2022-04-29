const express = require("express");
const router = express.Router();
const { AnalyzedSGFfile, AnalyzedGame } = require("../models");
const { validateToken } = require("../middlewares/AuthMiddleware");


router.get("/my-analyzed-games", validateToken, async (req, res) => {
    const listOfAnalyzedSGFfile = await AnalyzedSGFfile.findAll({
        where: { PlayerUserId: req.user.id },
        include: [{
            model: AnalyzedGame,
            order: [
                ['Color', 'ASC'],
            ],
        }],
        order: [
            ['createdAt', 'DESC'],
            // ['id', 'ASC'],
        ],
    });
    res.json({ listOfAnalyzedSGFfile: listOfAnalyzedSGFfile });
});


module.exports = router;
