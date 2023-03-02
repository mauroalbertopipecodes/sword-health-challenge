"use strict";

var express = require('express');

var router = express.Router();

var baseController = require('../controllers/base.controller');

var authController = require('../controllers/auth.controller');

var _require = require('../utils/encryption'),
    parseJwt = _require.parseJwt;

router.get('/', function (req, res, next) {
  return res.status(200).json();
});
/*** GENERAL ENDPOINTS */

/*** BASE CONTROLLER ENDPOINTS */

/** TASKS */

router.get('/tasks', baseController.fetchAllTask);
router.post('/task/create', authController.authorizedTechnician(parseJwt), baseController.createTask(parseJwt));
router.put('/task/update', authController.authorizedTechnician(parseJwt), baseController.updateTask(parseJwt));
router["delete"]('/task/delete', authController.authorizedManager(parseJwt), baseController.deleteTask);
/** USERS */

router.post('/user/create', authController.createUser);
/** AUTH */

router.post('/login', authController.login);
module.exports = router;