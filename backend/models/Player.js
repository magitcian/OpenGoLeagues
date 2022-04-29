module.exports = (sequelize, DataTypes) => {
    const Player = sequelize.define("Player", {
        UserId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            //autoIncrement: true
        },
    });

    Player.associate = (models) => {
        //Player.belongsTo(models.User);
        Player.belongsTo(models.User, {
            foreignKey: 'UserId',
        });
        Player.belongsTo(models.Level);
        Player.belongsToMany(models.League, { through: models.Subscribe });
        //Player.hasMany(models.Subscribe, {as:'PlayerId', foreignKey: 'playerUserId'});
        Player.hasMany(models.Subscribe);
        Player.hasMany(models.Game, {
            foreignKey: 'WhitePlayerId',
            onDelete: "SET NULL",
        });
        Player.hasMany(models.Game, {
            foreignKey: 'BlackPlayerId',
            onDelete: "SET NULL",
        });
        Player.hasMany(models.LevelHistory, {
            onDelete: "CASCADE",
        });
        Player.hasMany(models.AnalyzedSGFfile, {
            onDelete: "CASCADE",
        });
        Player.hasOne(models.KGSdata, {
            onDelete: "CASCADE",
        });
    };

    return Player;
};