const express = require('express');
const router = express.Router();

const baseController = require('../controllers/base.controller');
const authController = require('../controllers/auth.controller');

/*** GENERAL ENDPOINTS */

// Service checkpoint status
router.get('/', function (req, res, next) {
  res.status(200).json({ message: `Service running` });
});

/*** BASE CONTROLLER ENDPOINTS */

/** TASKS */
router.get('/tasks', baseController.fetchAllTask);
router.post(
  '/task/create',
  authController.authorizedTechnician,
  baseController.createTask,
);
router.put(
  '/task/update',
  authController.authorizedTechnician,
  baseController.updateTask,
);
router.delete(
  '/task/delete',
  authController.authorizedManager,
  baseController.deleteTask,
);

/** USERS */
router.post('/user/create', authController.createUser);

/** AUTH */
router.post('/login', authController.login);

module.exports = router;
