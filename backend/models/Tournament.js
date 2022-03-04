module.exports = (sequelize, DataTypes) => {
    const Tournament = sequelize.define("Tournament", {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isOpen: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
    });

    Tournament.associate = (models) => {
        Tournament.belongsTo(models.League);
        // League.hasMany(models.Player, {
        //     onDelete: "cascade",
        // });
        Tournament.belongsToMany(models.Player, { through: models.Participate });
        Tournament.hasMany(models.Participate);
        Tournament.hasMany(models.Game);
    };

    return Tournament;
};