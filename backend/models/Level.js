module.exports = (sequelize, DataTypes) => {
    const Level = sequelize.define("Level", {
        level: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        levelNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });

    Level.associate = (models) => {
        Level.hasMany(models.Player, {
            onDelete: "SET NULL",
        });
        Level.hasMany(models.LevelHistory, {
            onDelete: "SET NULL",
        });
    };

    return Level;
};