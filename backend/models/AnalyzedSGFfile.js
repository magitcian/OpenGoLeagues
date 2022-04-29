module.exports = (sequelize, DataTypes) => {
    const AnalyzedSGFfile = sequelize.define("AnalyzedSGFfile", {
        SgfFileName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        VisitsAverage: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
       
    });

    AnalyzedSGFfile.associate = (models) => {
        AnalyzedSGFfile.belongsTo(models.Player);
        AnalyzedSGFfile.hasMany(models.AnalyzedGame, {
            onDelete: "CASCADE",
        });
    };

    return AnalyzedSGFfile;
};