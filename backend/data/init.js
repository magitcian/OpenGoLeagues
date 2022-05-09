const { User, Level, Game, KGSdata, League, LevelHistory, Manager, Participate, Player, Subscribe, Tournament, AnalyzedGame } = require("../models");

async function deleteDataInDB() {

  await Manager.destroy({
    where: {},
    truncate: true
  });

  await Player.destroy({
    where: {},
    truncate: true
  });

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

  await Participate.destroy({
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

  await AnalyzedGame.destroy({
    where: {},
    truncate: true
  });

}

async function addDataInDB() {
  //add data in level table:
  let levels = ["20K", "15k", "10k", "5k", "4k", "3k", "2k", "1k", "1d", "2d", "3d", "4d", "5d", "6d", "7d", "8d", "9d"]
  let idLevel = 0;
  levels.forEach(async (l) => {
    ++idLevel;
    let levelValue = 0;
    if (l.includes("k")) {
      levelValue = parseInt("-" + l.replace("k", ""));
    } else {
      levelValue = parseInt(l.replace("d", "")) -1;
    }
    let level =
    {
      "id": idLevel,
      "level": l,
      "value": levelValue,
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
  let user4 =
  {
    "id": "4",
    "firstName": "player1",
    "lastName": "p1",
    "email": "player1@epfc.eu",
  }
  let user5 =
  {
    "id": "5",
    "firstName": "player2",
    "lastName": "p2",
    "email": "player2@epfc.eu",
  }
  const bcrypt = require("bcrypt");
  let password = "Password1,"
  await bcrypt.hash(password, 10).then((hash) => {
    user1.password = hash;
    user2.password = hash;
    user3.password = hash;
    user4.password = hash;
    user5.password = hash;
  });
  await User.create(user1);
  await User.create(user2);
  await User.create(user3);
  await User.create(user4);
  await User.create(user5);

  //add data in player table:
  let users = [user1, user2, user3, user4, user5];
  let usersLevelId = [1, 11, 5, 9, 12]
  for (let i = 0; i < users.length; i++) {
    let player =
    {
      //"id": users[i].id,
      "LevelId": usersLevelId[i],
      "UserId": users[i].id,
    }
    await Player.create(player);
  }

  //add data in manager table:
  let manager1 =
  {
    //"id": 1,
    //"PlayerId": user1.id,
    "UserId": user1.id,
  }
  await Manager.create(manager1);

  let manager2 =
  {
    //"id": 2,
    //"PlayerId": user2.id,
    "UserId": user2.id,
  }
  await Manager.create(manager2);

  // let manager4 =
  // {
  //   "UserId": user4.id,
  // }
  // await Manager.create(manager4);

  //add data in league table:
  let league1 =
  {
    "id": 1,
    "name": "FrenchDanMicroLeague",
    "description": "League for french player with minimum a dan level",
    "ManagerUserId" : manager2.UserId,
    "isOpen" : true,
  }
  let league2 =
  {
    "id": 2,
    "name": "LeagueTest2",
    "description": "description league test 2",
    "ManagerUserId" : manager1.UserId,
    "isOpen" : true,
  }
  let league3 =
  {
    "id": 3,
    "name": "LeagueTest3",
    "description": "description league test 3",
    "ManagerUserId" : manager1.UserId,
    "isOpen" : false,
  }
  await League.create(league1);
  await League.create(league2);
  await League.create(league3);

  //bind leagues and player
  let subscribesLeague1 = [user3, user4, user5];
  for(let i = 0; i < subscribesLeague1.length; i++){
    let subscribe =
    {
      "LeagueId": league1.id,
      "PlayerUserId" : subscribesLeague1[i].id,
      "Status" : 1,
    }
    await Subscribe.create(subscribe);
  }

  let subscribesLeague2 = [user2, user4, user5];
  for(let i = 0; i < subscribesLeague2.length; i++){
    let subscribe =
    {
      "LeagueId": league2.id,
      "PlayerUserId" : subscribesLeague2[i].id,
      "Status" : 2,
    }
    await Subscribe.create(subscribe);
  }




}

module.exports = { deleteDataInDB, addDataInDB };

