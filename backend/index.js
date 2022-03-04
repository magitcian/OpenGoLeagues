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

db.sequelize.sync().then(async() => {
    //Initialize data in DB
    const init = require("./data/init");
    await init.deleteDataInDB();
    await init.addDataInDB();

    app.listen(3001, async() => {
        console.log("Server running on port 3001");
    });
});