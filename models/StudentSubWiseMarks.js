const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const StudentSubWiseMarks = sequelize.define('StudentSubWiseMarks', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    subject_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    subject_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    subject_code:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    final_Subj_code:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    registration_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    assignments: {
      type: DataTypes.JSON, // Use JSON data type to store an array
      allowNull: false,
    },
  });

  module.exports = StudentSubWiseMarks;
