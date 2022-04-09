module.exports = (sequelize, DataTypes) => {
    const AnalyzedGame = sequelize.define("AnalyzedGame", {
        SgfFileName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        BlackLevel: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Black1stChoice: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        Black2ndChoice: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        BlackTotalAnalyzedMoves: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        BlackUnexpectedMoves: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        BlackMatchRateOfMoves1And2: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        IsBlackCheating: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },

        WhiteLevel: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        White1stChoice: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        White2ndChoice: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        WhiteTotalAnalyzedMoves: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        WhiteUnexpectedMoves: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        WhiteMatchRateOfMoves1And2: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        IsWhiteCheating: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
    });

    AnalyzedGame.associate = (models) => {
        AnalyzedGame.belongsTo(models.Player);
    };

    return AnalyzedGame;
};