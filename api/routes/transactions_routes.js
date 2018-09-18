//DEPENDENCIES
const express = require('express');
const router = express.Router();

//CONTROLLER IMPORTING
const transactionsController = require('../controllers/transactions_controller');

//MIDDLEWARE
const checkJWT = require('../middleware/checkAuth');

//ROUTES DECLARATION

//FETCH ALL TRANSACTIONS ON THE DATABASE
router.get('/all', checkJWT, transactionsController.fetch_all_TRANSACTIONS);

//FETCH ALL TRANSACTIONS ON THE DATABASE
router.get('/tables', checkJWT, transactionsController.fetch_month_any_TRANSACTIONS);

//FETCH ALL TRANSACTIONS FROM A CERTAIN USER ON THE DATABASE
router.get('/:owner', checkJWT, transactionsController.fetch_all_transactions_from_USER);

//FETCH CURRENT BALANCE FROM A CERTAIN USER
router.get('/balance/:owner', checkJWT, transactionsController.fetch_user_current_BALANCE);

//FETCH INCOME AND OUTCOME FROM CURRENT MONTH (PREDICTIONS AND EXECUTED)
router.get('/in_outcome/:owner', checkJWT, transactionsController.fetch_income_outcome_state_current_MONTH);

//FETCH PROFITS FROM CURRENT MONTH
router.get('/profit/:owner', checkJWT, transactionsController.fetch_PROFITS);

//FETCH INCOME AND OUTCOME FROM CURRENT MONTH (PREDICTIONS AND EXECUTED)
router.get('/specific/in_outcome/:owner', checkJWT, transactionsController.fetch_income_outcome_state_specific_MONTH);

//FETCH FLUX FROM LAST 6 MONTHS FROM A CERTAIN USER
router.get('/flux6/:owner', checkJWT, transactionsController.fetch_flux6_MONTHS);

//FETCH COMPARE TRANSACTIONS FROM LAST MONTH FROM A CERTAIN USER
router.get('/monthcompare/:owner', checkJWT, transactionsController.fetch_compareLast_MONTH);

//FETCH LAST TRANSACTION FROM A CERTAIN USER
router.get('/last/:owner', checkJWT, transactionsController.fetch_last_TRANSACTION);

//FETCH LAST 4 TRANSACTIONS FROM A CERTAIN USER
router.get('/last/dashboard/:owner', checkJWT, transactionsController.fetch_dashboard_last_TRANSACTION);

//FETCH OUTCOME NOTIFICATIONS
router.get('/today/notifications', checkJWT, transactionsController.fetch_outcome_NOTIFICATIONS);

//INSERT A TRANSACTION INTO THE DATABASE
router.post('/add', checkJWT, transactionsController.add_TRANSACTION);

//UPDATE A TRANSACTION INTO THE DATABASE
router.patch('/update/:transactionID', checkJWT, transactionsController.update_TRANSACTION);

//DELETE A TRANSACTION FROM THE DATABASE
router.delete('/delete', checkJWT, transactionsController.delete_TRANSACTION);

module.exports = router;