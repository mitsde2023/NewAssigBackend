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
  // program_name: {
  //   type: DataTypes.STRING,
  //   allowNull: true
  // },
  // batch_name: {
  //   type: DataTypes.STRING,
  //   allowNull: true
  // },
  subject_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  subject_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
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
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = StudentSubWiseMarks;
