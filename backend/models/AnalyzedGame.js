module.exports = (sequelize, DataTypes) => {
    const AnalyzedGame = sequelize.define("AnalyzedGame", {
        Color: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Level: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        "1stChoice": {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        "2ndChoice": {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        TotalAnalyzedMoves: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        UnexpectedMoves: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        IsCheating: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },

    });

    AnalyzedGame.associate = (models) => {
        AnalyzedGame.belongsTo(models.AnalyzedSGFfile, {
            onDelete: "CASCADE",
        });
    };

    return AnalyzedGame;
};