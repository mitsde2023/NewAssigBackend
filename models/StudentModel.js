const { DataTypes } = require('sequelize');
const sequelize = require('../config'); // Update with your database configuration

const StudentModel = sequelize.define('StudentModel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: true,
},
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  registration_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  program_id:{
    type:DataTypes.INTEGER,
    allowNull:true
  },
  batch_id:{
    type:DataTypes.INTEGER,
    allowNull:true
  },
  user_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  user_username: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contact_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = StudentModel;
