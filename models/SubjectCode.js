const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const StudentSubCode = sequelize.define('SubjectCode', {
    Code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Subject: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

module.exports = StudentSubCode;
