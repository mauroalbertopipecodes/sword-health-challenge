"use strict";

var sequelize = require('../database/database');

var _require = require('sequelize'),
    DataTypes = _require.DataTypes;

var _require2 = require('../utils/encryption'),
    encrypt = _require2.encrypt,
    decrypt = _require2.decrypt;

var Task = sequelize.define('Task', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  summary: {
    type: DataTypes.STRING,
    defaultValue: 'My Summary',
    allowNull: false,
    validate: {
      len: {
        args: [1, 2500],
        msg: 'Maximum 2500 characters allowed in Summary'
      },
      notNull: {
        msg: 'Please enter a summary'
      }
    }
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    },
    allowNull: false
  }
}, {
  hooks: {
    beforeCreate: function beforeCreate(task) {
      var mystr;
      return regeneratorRuntime.async(function beforeCreate$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              mystr = encrypt(task.summary);
              task.summary = mystr;

            case 2:
            case "end":
              return _context.stop();
          }
        }
      });
    },
    beforeBulkUpdate: function beforeBulkUpdate(task) {
      var mystr;
      return regeneratorRuntime.async(function beforeBulkUpdate$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              mystr = encrypt(task.attributes.summary);
              task.attributes.summary = mystr;

            case 2:
            case "end":
              return _context2.stop();
          }
        }
      });
    },
    afterFind: function afterFind(tasks) {
      return regeneratorRuntime.async(function afterFind$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              tasks.forEach(function (task) {
                var mystr = decrypt(task.dataValues.summary);
                task.summary = mystr;
              });

            case 1:
            case "end":
              return _context3.stop();
          }
        }
      });
    }
  }
});
module.exports = Task;