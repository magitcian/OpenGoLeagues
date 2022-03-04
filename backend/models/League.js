module.exports = (sequelize, DataTypes) => {
    const League = sequelize.define("League", {
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

    League.associate = (models) => {
        League.belongsTo(models.Manager);
        // League.hasMany(models.Player, {
        //     onDelete: "cascade",
        // });
        League.belongsToMany(models.Player, { through: models.Subscribe });
        League.hasMany(models.Subscribe, {
            onDelete: "SET NULL",
        });
    };

    return League;
};