const express = require("express");
const router = express.Router();
const { Subscribe, League, Manager, User, Player } = require("../models");
const { validateToken } = require("../middlewares/AuthMiddleware");
const Sequelize = require('sequelize');

router.get("/subscribed-list", validateToken, async (req, res) => {
    //const listOfSubscribes = await Subscribe.findAll({ where: { PlayerUserId: req.user.id }, include: [{model: League, include: [User]}] });
    //const listOfSubscribes = await Subscribe.findAll({ where: { PlayerUserId: req.user.id }, include: [League] });
    //const listOfManagers = await Manager.findAll({include: [{model: Player, include: [{model: User, attributes: { exclude: ["password"]}}]}] });
    //const listOfUsers = await User.findAll();
    const listOfSubscribes = await Subscribe.findAll({
        where: { PlayerUserId: req.user.id },
        include: [{
            model: League,
            include: [{
                model: Manager,
                include: [{
                    model: Player,
                    include: [{
                        model: User,
                        attributes: { exclude: ["password"] }
                    }]
                }]
            }]
        }]
    });
    res.json({ listOfSubscribes: listOfSubscribes });
});

router.get("/not-subscribed-list", validateToken, async (req, res) => {

    const listOfSub = await Subscribe.findAll({
        where: {
            PlayerUserId: req.user.id
        }
    });

    // map the property to an array of just the IDs
    const subId = listOfSub.map((sub) => sub.LeagueId);

    const listOfLeaguesNotSub = await League.findAll({
        where: {
            Id: {
                [Sequelize.Op.not]: [subId]
            }
        },
        include: [{
            model: Manager,
            include: [{
                model: Player,
                include: [{
                    model: User,
                    attributes: { exclude: ["password"] }
                }]
            }]
        }]
    });
    res.json({ listOfLeaguesNotSub: listOfLeaguesNotSub });
});



module.exports = router;
