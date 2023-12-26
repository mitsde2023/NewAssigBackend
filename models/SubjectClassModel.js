const { DataTypes } = require('sequelize');
const sequelize = require('../config'); // Update with your database configuration

const SubjectClassModel = sequelize.define('SubjectClassModel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: true,
  },
  subject_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  subject_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  program_id:{
    type:DataTypes.INTEGER,
    allowNull:true
  },
  program_name:{
    type:DataTypes.STRING,
    allowNull:true
  },
  batch_id:{
    type:DataTypes.INTEGER,
    allowNull:true
  },
  batch_name:{
    type:DataTypes.STRING,
    allowNull:true
  },
  tutor_name:{
    type:DataTypes.STRING,
    allowNull:true
  },
  start_date: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  end_date: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
});

module.exports = SubjectClassModel;
