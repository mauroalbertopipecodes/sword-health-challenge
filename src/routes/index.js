const express = require('express');
const router = express.Router();

const baseController = require('../controllers/base.controller');
const authController = require('../controllers/auth.controller');
const { parseJwt } = require('../utils/encryption');

router.get('/', function (req, res, next) {
  return res.status(200).json();
});

/*** GENERAL ENDPOINTS */

/*** BASE CONTROLLER ENDPOINTS */

/** TASKS */
router.get('/tasks', baseController.fetchAllTask);
router.post(
  '/task/create',
  authController.authorizedTechnician(parseJwt),
  baseController.createTask(parseJwt),
);
router.put(
  '/task/update',
  authController.authorizedTechnician(parseJwt),
  baseController.updateTask(parseJwt),
);
router.delete(
  '/task/delete',

  authController.authorizedManager(parseJwt),
  baseController.deleteTask,
);

/** USERS */
router.post('/user/create', authController.createUser);

/** AUTH */
router.post('/login', authController.login);

module.exports = router;
