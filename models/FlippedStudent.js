const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const FlippedStudent = sequelize.define('FlippedStudent', {
    registrationNo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    displayName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    course: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

module.exports = FlippedStudent;
