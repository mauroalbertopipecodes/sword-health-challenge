
const { INTERNAL_SERVER_ERROR, OK } = require('http-status');
const User = require('../models/User');

exports.testGet = [
  async (req, res, next) => {
    try {
      // Find all users
      const users = await User.findAll();
      return res.status(OK)
        .json({
          users
        });
    } catch (error) {
      console.error('Error querying database:', error);
      return res.status(INTERNAL_SERVER_ERROR)
        .json({
          message: 'Error querying database'
        });
    }
  }
]


exports.testPost = [
  async (req, res, next) => {
    try {
      // Saving an user
      const { firstName, lastName } = req.body;
      const newUser = await User.create({ firstName, lastName });

      return res.status(OK)
        .json({
          newUser
        });
    } catch (error) {
      console.error('Error querying database:', error);
      return res.status(INTERNAL_SERVER_ERROR)
        .json({
          message: 'Error querying database'
        });
    }
  }
]
