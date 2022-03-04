module.exports = (sequelize, DataTypes) => {
    const Participate = sequelize.define("Participate", {

    });

    Participate.associate = (models) => {
        Participate.belongsTo(models.Player);
        Participate.belongsTo(models.Tournament);
    };

    return Participate;
};