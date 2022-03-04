module.exports = (sequelize, DataTypes) => {
    const Manager = sequelize.define("Manager", {

    });

    Manager.associate = (models) => {
        Manager.belongsTo(models.Player);
        Manager.hasMany(models.League, {
            onDelete: "cascade",
        });
    };

    return Manager;
};