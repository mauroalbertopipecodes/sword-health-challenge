const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const User = sequelize.define('User', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = User;
