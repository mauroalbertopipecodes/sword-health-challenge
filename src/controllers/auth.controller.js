const {
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED,
  NOT_FOUND,
  OK,
} = require('http-status');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const { parseJwt } = require('../utils/encryption');
const TECHNICIAN = 'Technician';
const MANAGER = 'Manager';
/**
 * Performs the login process.
 *
 * @param {*} req
 * @param {*} res
 */
exports.login = async (req, res) => {
  const email = req.body?.email;
  const password = req.body?.password;

  if (!email || !password) {
    return res.status(BAD_REQUEST).json({
      message: 'Invalid request. Missing parameters email or password.',
    });
  }

  const user = await User.findOne({ where: { email: email } });

  if (!user) {
    return res.status(NOT_FOUND).json({
      message: 'User not found.',
    });
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(UNAUTHORIZED).json({
      message: 'Incorrect Password.',
    });
  }

  return res.status(OK).json({
    message: 'Login successful.',
    token: jwt.sign(
      {
        email: user.email,
        fullName: user.fullName,
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
    ),
  });
};

/**
 * Checks if the "user" property is
 * set on the request, which will be
 * if a valid Bearer token was sent
 * in the request previously.
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.authorizedManager = async (req, res, next) => {
  const token = req.headers.authorization.replace('Bearer ', '');
  const result = parseJwt(token);
  if (!token || result.role !== MANAGER) {
    return res.status(UNAUTHORIZED).json({
      message: 'Unauthorized to access this page.',
    });
  }

  next();
};

exports.authorizedTechnician = async (req, res, next) => {
  const token = req.headers.authorization.replace('Bearer ', '');
  const result = parseJwt(token);
  if (!token || result.role !== TECHNICIAN) {
    return res.status(UNAUTHORIZED).json({
      message: 'Unauthorized to access this page.',
    });
  }

  next();
};

/**
 * Creates a new
 * user profile.
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */

exports.createUser = async (req, res) => {
  try {
    // Saving an user
    const { firstName, lastName, age, email, password, role } = req.body;
    const passworHashed = bcrypt.hashSync(password, 10);
    const newUser = await User.create({
      id: uuidv4(),
      firstName,
      lastName,
      age,
      email,
      password: passworHashed,
      role: role,
    });

    return res.status(OK).json({
      newUser,
    });
  } catch (error) {
    console.error('Error inserting user:', error);
    return res.status(INTERNAL_SERVER_ERROR).json({
      message: 'Error inserting user',
      errors: error?.errors,
    });
  }
};
