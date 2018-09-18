//DEPENDENCIES
const express = require('express');
const router = express.Router();

//MIDDLEWARE
const checkJWT = require('../middleware/checkAuth');

//CONTROLLER IMPORTING
const usersController = require('../controllers/users_controller');

//ROUTES DECLARATION

//FIND ALL USERS ON THE DATABASE
router.get('/all', checkJWT, usersController.fetch_all_USERS);

//FIND USER BY IT'S ID ON THE DATABASE
router.get('/:userID', checkJWT, usersController.fetch_user_by_ID);

//CREATE A NEW USER ON THE DATABASE
router.post('/add', usersController.create_USER);

//USER LOGIN
router.post('/login', usersController.login_USER);

//DELETE AN USER FROM THE DATABASE
router.delete('/:userID', checkJWT, usersController.delete_USER);

//UPDATE AN USER FROM THE DATABASE
router.patch('/:userID', checkJWT, usersController.update_USER);

module.exports = router;