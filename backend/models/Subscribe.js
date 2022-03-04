module.exports = (sequelize, DataTypes) => {
    const Subscribe = sequelize.define("Subscribe", {

    });

    Subscribe.associate = (models) => {
        Subscribe.belongsTo(models.Player);
        Subscribe.belongsTo(models.League);
    };

    return Subscribe;
};