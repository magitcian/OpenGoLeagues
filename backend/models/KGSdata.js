module.exports = (sequelize, DataTypes) => {
    const KGSdata = sequelize.define("KGSdata", {
        pseudo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    KGSdata.associate = (models) => {
        KGSdata.belongsTo(models.User);
    };

    return KGSdata;
};