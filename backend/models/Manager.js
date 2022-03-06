module.exports = (sequelize, DataTypes) => {
    const Manager = sequelize.define("Manager", {
        UserId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            //autoIncrement: true
        },
    });

    Manager.associate = (models) => {
        //Manager.belongsTo(models.Player);
        Manager.belongsTo(models.Player, {
            foreignKey: 'UserId',
        });
        Manager.hasMany(models.League, {
            onDelete: "cascade",
        });
    };

    return Manager;
};