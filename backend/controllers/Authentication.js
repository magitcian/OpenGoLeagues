const express = require("express");
const router = express.Router();
const { User, Manager, Player, Level } = require("../models");
const bcrypt = require("bcrypt");
const { validateToken } = require("../middlewares/AuthMiddleware");
const { sign } = require("jsonwebtoken");

router.post("/", async (req, res) => {
  const { firstName, lastName, email, password, level } = req.body;
  bcrypt.hash(password, 10).then(async (hash) => {
    const user = await User.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hash,
    });
    const playerLevel = await Level.findOne({ where: { levelNumber: level } });
    await Player.create({
      UserId: user.id,
      LevelId: playerLevel.id,
    });
    res.json("SUCCESS");
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email: email } });

  if (!user) res.json({ error: "User doesn't exist" });

  const isUserManager = await isManager(user.id);
  bcrypt.compare(password, user.password).then(async (match) => {
    if (!match) res.json({ error: "Wrong email and password combination" });

    const accessToken = sign( //ici qu'on enregistre l'utilisateur dans le token?
      { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, isManager: isUserManager },
      //"importantsecret"
      "AYU3Gigiu33FYFuFkg786uiDY6164hguisdqsf264qsf68RgcjKj75hooLGF99"
    );
    res.json({ token: accessToken, id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, isManager: isUserManager });
  });
});

router.get("/auth", validateToken, async (req, res) => { //validateToken : uniquement pour les personnes connectées
  //console.log(req.user);
  //req.user.isManager = await isManager(req.user.id); //plus nécessaire puisqu'enregistré dans le sign/token
  res.json(req.user);
});

async function isManager(userId) {
  const manager = await Manager.findOne({ where: { UserId: userId } });
  let isManager = false;
  if (manager) {
    isManager = true;
  }
  console.log(isManager);
  return isManager;
}

router.get("/basicinfo/:id", validateToken, async (req, res) => {
  const id = req.params.id;

  const basicInfo = await User.findByPk(id, {
    attributes: { exclude: ["password"] },
  });

  res.json(basicInfo);
});

router.put("/changepassword", validateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findOne({ where: { email: req.user.email } });

  bcrypt.compare(oldPassword, user.password).then(async (match) => {
    if (!match) {
      res.json({ error: 'Wrong Password Entered! ' + oldPassword + " " + user.password });
    } else {
      bcrypt.hash(newPassword, 10).then((hash) => {
        User.update(
          { password: hash },
          { where: { email: req.user.email } }
        );
        res.json("SUCCESS");
      });
    }
  });
});

module.exports = router;
