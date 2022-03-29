module.exports = (sequelize, DataTypes) => {
    const Subscribe = sequelize.define("Subscribe", {
        // PlayerId: {
        //     type: DataTypes.INTEGER,
        //     foreignKey: true
        // },
        Status: {
            type: DataTypes.INTEGER,
            foreignKey: true
        },
    });

    Subscribe.associate = (models) => {
        //Subscribe.belongsTo(models.Player, {as:'PlayerId', foreignKey: 'UserId'});
        Subscribe.belongsTo(models.Player);
        Subscribe.belongsTo(models.League);
    };

    return Subscribe;
};

//Status:
// 1 => registered
// 2 => registration to validate
// 3 => registration refused
// 4 => player quit the league (if he participates at one tournament minimum else subscription is deleted)