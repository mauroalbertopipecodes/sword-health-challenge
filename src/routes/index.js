const express = require('express')
const router = express.Router()

const baseController = require('../controllers/base.controller')

/*** GENERAL ENDPOINTS */

// Service checkpoint status
router.get('/', function(req, res, next) {
    res.status(200).json({ message: `Service running`})
});

/*** BASE CONTROLLER ENDPOINTS */
router.get('/test', baseController.testGet);
router.post('/test', baseController.testPost);


module.exports = router
