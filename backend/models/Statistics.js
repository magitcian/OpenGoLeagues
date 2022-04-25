module.exports = (sequelize, DataTypes) => {
    const Statistics = sequelize.define("Statistics", {
        SgfFileName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        Path: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        VisitsAverage: {
            type: DataTypes.INTEGER,
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
            type: DataTypes.DOUBLE,
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
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
    });

    Statistics.associate = (models) => {

    };

    return Statistics;
};