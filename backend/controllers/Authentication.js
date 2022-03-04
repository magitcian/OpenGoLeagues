const express = require("express");
const router = express.Router();
const { User } = require("../models");
const bcrypt = require("bcrypt");
const { validateToken } = require("../middlewares/AuthMiddleware");
const { sign } = require("jsonwebtoken");

router.post("/", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  bcrypt.hash(password, 10).then((hash) => {
    User.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hash,
    });
    res.json("SUCCESS");
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email: email } });

  if (!user) res.json({ error: "User doesn't exist" });

  bcrypt.compare(password, user.password).then(async (match) => {
    if (!match) res.json({ error: "Wrong email and password combination" });

    const accessToken = sign(
      { firstName: user.firstName, lastName: user.lastName, email: user.email, id: user.id },
      "importantsecret"
    );
    res.json({ token: accessToken, firstName: user.firstName, lastName: user.lastName, email: email, id: user.id });
  });
});

router.get("/auth", validateToken, (req, res) => { //validateToken : uniquement pour les personnes connectées
  res.json(req.user);
});

router.get("/basicinfo/:id",validateToken, async (req, res) => { 
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
