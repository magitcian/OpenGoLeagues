module.exports = (sequelize, DataTypes) => {
    const LevelHistory = sequelize.define("LevelHistory", {
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    });

    LevelHistory.associate = (models) => {
        LevelHistory.belongsTo(models.Level);
        LevelHistory.belongsTo(models.Player);
    };

    return LevelHistory;
};