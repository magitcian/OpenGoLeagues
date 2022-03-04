const {  User, Level, Game, KGSdata, League, LevelHistory, Manager, Participate, Player, Subscribe, Tournament } = require("../models");
//Comments, Users, Posts, Likes,
async function deleteDataInDB() {

      await User.destroy({
        where: {},
        truncate: true
      });

      await Level.destroy({
        where: {},
        truncate: true
      });

      await Game.destroy({
        where: {},
        truncate: true
      });

      await KGSdata.destroy({
        where: {},
        truncate: true
      });

      await League.destroy({
        where: {},
        truncate: true
      });

      await LevelHistory.destroy({
        where: {},
        truncate: true
      });

      await Manager.destroy({
        where: {},
        truncate: true
      });

      await Participate.destroy({
        where: {},
        truncate: true
      });

      await Player.destroy({
        where: {},
        truncate: true
      });

      await Subscribe.destroy({
        where: {},
        truncate: true
      });

      await Tournament.destroy({
        where: {},
        truncate: true
      });

}

async function addDataInDB() {
    //add data in level table:
    let levels =["20K", "15k", "10k", "5k", "4k", "3k", "2k", "1k", "1d", "2d", "3d", "4d", "5d", "6d","7d", "8d", "9d"]
    let idLevel = 0;
    levels.forEach( async (l) => {
        ++idLevel;
        let levelNumber =0;
        if(l.includes("k")){
            levelNumber = parseInt("-" + l.replace("k",""));
        }else{
            levelNumber = parseInt(l.replace("d",""));
        }
        let level =
        {
            "id": idLevel,
            "level": l,
            "levelNumber": levelNumber,
        }
        //console.log(level);
        await Level.create(level);
    })

    //add data in user table:
    let user1 =
    {
        "id": "1",
        "firstName": "Sev",
        "lastName": "",
        "email": "sev@epfc.eu",
    }
    let user2 =
    {
        "id": "2",
        "firstName": "Gaby",
        "lastName": "",
        "email": "gaby@epfc.eu",
    }
    let user3 =
    {
        "id": "3",
        "firstName": "test",
        "lastName": "test",
        "email": "test@epfc.eu",
    }
    const bcrypt = require("bcrypt");
    let password = "Password1,"
    await bcrypt.hash(password, 10).then( (hash) => {
        user1.password = hash;
        user2.password = hash;
        user3.password = hash;
      });  
    await User.create(user1);
    await User.create(user2);
    await User.create(user3);

    //add data in player table:
    let users = [user1, user2, user3];
    let usersLevelId = [1, 11, 5]
    for (let i = 0; i < users.length; i++) {
        let player =
        {
            "id": users[i].id,
            "LevelId": usersLevelId[i],
            "UserId": users[i].id,
        }
        await Player.create(player);
    }

    //add data in manager table:
    let manager =
    {
        "id": 1,
        "PlayerId": user2.id,
    }
    await Manager.create(manager);


}

module.exports = { deleteDataInDB, addDataInDB };

