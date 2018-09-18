//DEPENDENCIES
const express = require('express');
const router = express.Router();

//CONTROLLER IMPORTING
const balanceController = require('../controllers/balance_controller');

//MIDDLEWARE
const checkJWT = require('../middleware/checkAuth');

//ROUTES DECLARATION

//FETCH CURRENT BALANCE
router.get('/:ownerID', checkJWT, balanceController.get_current_BALANCE);

module.exports = router;