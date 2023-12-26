// BatchModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config'); // Update with your database configuration
const ProgramModel = require('./ProgramModel'); // Import the BundleModel

const BatchModel = sequelize.define('BatchModel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: true,
  },
  batch_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: true,
  },
  batch_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  start_date: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  end_date: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  admitted_students: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

// Establishing the relationship with BundleModel
BatchModel.belongsTo(ProgramModel, {
  foreignKey: 'program_id',
  onDelete: 'CASCADE', // You can adjust the onDelete behavior based on your requirement
});

module.exports = BatchModel;
