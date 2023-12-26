const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Log = sequelize.define('Log', {
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  level: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'logs',
});

module.exports = Log;
