module.exports = (sequelize, DataTypes) => {
    const Player = sequelize.define("Player", {

    });

    Player.associate = (models) => {
        Player.belongsTo(models.User);
        Player.belongsTo(models.Level);
        Player.belongsToMany(models.League, { through: models.Subscribe });
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
    };

    return Player;
};