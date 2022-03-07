const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());

const db = require("./models");

// Routers
const authRouter = require("./controllers/Authentication");
app.use("/auth", authRouter);
const userRouter = require("./controllers/Users");
app.use("/users", userRouter);
const leagueRouter = require("./controllers/League");
app.use("/league", leagueRouter);
const subRouter = require("./controllers/Subscribe");
app.use("/subscribe", subRouter);

db.sequelize.sync().then(async() => {
    // //Initialize data in DB
    // const init = require("./data/init");
    // await init.deleteDataInDB();
    // await init.addDataInDB();

    const testLeelaz = require("./testLeelaz");
    testLeelaz.leelaz();

    app.listen(3001, async() => {
        console.log("Server running on port 3001");
    });
});