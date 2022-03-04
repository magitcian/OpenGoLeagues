module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    User.associate = (models) => {
        // User.hasOne(models.Player, {
        //     onDelete: "CASCADE",
        // });
        User.hasOne(models.KGSdata, {
            onDelete: "CASCADE",
        });
    };

    return User;
};