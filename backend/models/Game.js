module.exports = (sequelize, DataTypes) => {
    const Game = sequelize.define("Game", {
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        result: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        score: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        handicap_stone: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        SGFilePath: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    Game.associate = (models) => {
        Game.belongsTo(models.Tournament);
        Game.belongsTo(models.Player, {
            foreignKey: 'WhitePlayerId'
        });
        Game.belongsTo(models.Player, {
            foreignKey: 'BlackPlayerId'
        });
    };

    return Game;
};