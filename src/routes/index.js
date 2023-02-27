const express = require('express')
const router = express.Router()

const baseController = require('../controllers/base.controller')
const authController = require('../controllers/auth.controller')

/*** GENERAL ENDPOINTS */

// Service checkpoint status
router.get('/', function(req, res, next) {
    res.status(200).json({ message: `Service running`})
});

/*** BASE CONTROLLER ENDPOINTS */
router.get('/test', authController.authorized, baseController.testGet);
router.post('/test', authController.authorized, baseController.testPost);

/** AUTH */
router.post('/login', authController.login);
router.post('/user', authController.createUser);


module.exports = router
