//Command : node index.js ou npm start
const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());

const db = require("./models");

// Routers
const authRouter = require("./controllers/Authentication");
app.use("/auth", authRouter);
const subRouter = require("./controllers/Subscribe");
app.use("/subscribe", subRouter);
const anGamesRouter = require("./controllers/AnalyzedGame");
app.use("/analyzedGame", anGamesRouter);
const leelaRouter = require("./controllers/LeelaZero");
app.use("/leelaZero", leelaRouter.router);
const SGFRouter = require("./controllers/SGFfile");
app.use("/sgfFile", SGFRouter.router);
const ManagerRouter = require("./controllers/Manager");
app.use("/manager", ManagerRouter);

const port = 3001; //Dev : 3001, Prod : 3003
db.sequelize.sync().then(async() => {
    // //Initialize data in DB
    // const init = require("./data/init");
    // await init.deleteDataInDB();
    // await init.addDataInDB();

    app.listen(port, async() => { 
        console.log("Server running on port", port);
    });
});