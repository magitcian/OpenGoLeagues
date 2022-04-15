const express = require("express");
const router = express.Router();
const { League, Manager } = require("../models");
const { validateToken } = require("../middlewares/AuthMiddleware");
const Sequelize = require('sequelize');

router.get("/own-leagues-list", validateToken, async (req, res) => {
    if(req.user.isManager){
        const listOfLeagues = await League.findAll({
            where: { ManagerUserId: req.user.id },
        });
        //console.log(listOfLeagues);
        res.json({ listOfLeagues: listOfLeagues });
    }else{
        res.json({ error: "You don't have a league because you're not a manager!" });
    }

});

module.exports = router;
