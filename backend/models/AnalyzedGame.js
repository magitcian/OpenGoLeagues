module.exports = (sequelize, DataTypes) => {
    const AnalyzedGame = sequelize.define("AnalyzedGame", {
        SgfFileName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // date: {
        //     type: DataTypes.DATE,
        //     allowNull: false,
        // },
        CorrespNumOfMoves1White: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        CorrespNumOfMoves2White: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }, 
        TotalAnalyzedMovesWhite: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        UnexpectedMovesWhite: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        CorrespNumOfMoves1Black: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        CorrespNumOfMoves2Black: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        TotalAnalyzedMovesBlack: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        UnexpectedMovesBlack: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });

    AnalyzedGame.associate = (models) => {
        AnalyzedGame.belongsTo(models.Player);
    };

    return AnalyzedGame;
};