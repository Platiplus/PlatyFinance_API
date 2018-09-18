//DEPENDENCIES
const mongoose = require('mongoose');

//DECLARATION OF USER MODEL
const balanceSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    owner:          { type: mongoose.Schema.Types.ObjectId, required: true },
    balance:        { type: Number,  required: true }    
});

//EXPORTING OF MODEL
module.exports = mongoose.model('Balance', balanceSchema, 'balance');