// BundleModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config'); // Update with your database configuration

const ProgramModel = sequelize.define('ProgramModel', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    program_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: true,
    },
    program_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

module.exports = ProgramModel;
