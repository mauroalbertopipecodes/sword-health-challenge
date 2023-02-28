const sequelize = require('../database/database');
const { DataTypes } = require('sequelize');
const { encrypt, decrypt } = require('../utils/encryption');

const Task = sequelize.define(
  'Task',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    summary: {
      type: DataTypes.STRING,
      defaultValue: 'My Summary',
      allowNull: false,
      validate: {
        len: {
          args: [1, 2500],
          msg: 'Maximum 2500 characters allowed in Summary',
        },
        notNull: {
          msg: 'Please enter a summary',
        },
      },
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      },
      allowNull: false,
    },
  },
  {
    hooks: {
      beforeCreate: async (task) => {
        var mystr = encrypt(task.summary);
        task.summary = mystr;
      },
      beforeBulkUpdate: async (task) => {
        var mystr = encrypt(task.attributes.summary);
        task.attributes.summary = mystr;
      },
      afterFind: async (tasks) => {
        tasks.forEach((task) => {
          var mystr = decrypt(task.dataValues.summary);
          task.summary = mystr;
        });
      },
    },
  },
);

module.exports = Task;
