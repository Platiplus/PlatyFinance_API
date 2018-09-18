//DEPENDENCIES
const mongoose = require('mongoose');
const moment = require('moment');

//MODEL IMPORTING
const Balance = require('../models/balance_model');

//METHODS DECLARATION

//FETCH CURRENT BALANCE
exports.get_current_BALANCE = (request, response, next) => {
  Balance.find({owner: request.params.ownerID})
  .exec()
  .then((balance) => {
    response.status(200).json({error: false, data: balance});
  })
  .catch((error) => {
    response.status(500).json({error: true, data: error.message});
  });
};