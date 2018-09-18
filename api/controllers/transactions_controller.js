//DEPENDENCIES
const mongoose = require('mongoose');
const moment = require('moment');

//MODEL IMPORTING
const Transaction = require('../models/transaction_model');
const User = require('../models/user_model');
const Balance = require('../models/balance_model');

//METHODS DECLARATION

//FIND ALL TRANSACTIONS ON THE DATABASE
exports.fetch_all_TRANSACTIONS = (request, response, next) => {
    Transaction.find()
    .exec()
    .then((collection) => {
        response.status(200).json({error: false, data: collection});
    })
    .catch((error) => {
        response.status(500).json({error: true, data: error.message});
    });
};

//FIND ALL (ANY TYPE) TRANSACTIONS FROM A SPECIFIC MONTH AND USER
exports.fetch_month_any_TRANSACTIONS = (request, response, next) => {
    let begin = request.headers.datei;
    let end = request.headers.datee;
    
    Transaction.find({owner: request.headers.owner, date: {$gte: begin, $lte: end}})
    .exec()
    .then((collection) => {
        let transactions = {
            income: [],
            outcome: [],
            outcome_fixed: []
        };
        
        collection.forEach(element => {
            switch(element['type']){
                case 1:
                if(element['fixed'] === true){
                    transactions['outcome_fixed'].push(element);
                } else {
                    transactions['outcome'].push(element);
                }
                break;
                default:
                transactions['income'].push(element);
                break;
            }
        });

        response.status(200).json({error: false, data: transactions});
    })
    .catch((error) => {
        response.status(500).json({error: true, data: error.message});
    });
};

//FIND ALL TRANSACTIONS FROM SPECIFIC USER
exports.fetch_all_transactions_from_USER = (request, response, next) => {
    Transaction.find({owner: request.params.owner})
    .exec()
    .then((collection) => {
        response.status(200).json({error: false, data: collection});
    })
    .catch((error) => {
        response.status(500).json({error: true, data: error.message});
    });
};

//FIND ALL TRANSACTIONS FROM SPECIFIC USER
exports.fetch_user_current_BALANCE = (request, response, next) => {
    User.find({_id: request.params.owner})
        .select('initialBalance')
        .exec()
        .then((balance) => {
            let currentBalance = balance[0]['initialBalance'];
    Transaction.find({owner: request.params.owner})
        .select('type value status')
        .exec()
        .then((collection) => {
            collection.forEach((element) => {
                if(element['type'] === 1){
                    switch(element['status']){
                        case true:
                        currentBalance -= element['value'];
                        break;
                    }
                } else {
                    switch(element['status']){
                        case true:
                        currentBalance += element['value'];
                        break;
                }
            }
        });
            currentBalance = Number(currentBalance.toFixed('2'));
            
            Balance.update({owner: request.params.owner}, {$set: {balance: currentBalance}}).exec();

            response.status(200).json({error: false, data: currentBalance});
        })
    })
    .catch((error) => {
        response.status(500).json({error: true, data: error.message});
    });
};

//FIND INCOMES AND OUTCOMES (PREDICTED AND EXECUTED) FROM CURRENT MONTH
exports.fetch_income_outcome_state_current_MONTH = (request, response, next) => {
    let begin = moment().startOf('day').startOf('month');
    let end = moment().endOf('day').endOf('month');

    Transaction.find({owner: request.params.owner, date: {$gte: begin, $lte: end}})
    .select('type value status')
    .exec()
    .then((collection) => {
        let results = {
            income_executed: 0,
            income_prediction: 0,
            outcome_executed: 0,
            outcome_prediction: 0
        };
        
        collection.forEach((element) => {
            if(element['type'] === 1){
                switch(element['status']){
                    case true:
                    results['outcome_executed'] += element['value'];}
                    results['outcome_prediction'] += element['value'];
                } else {
                    switch(element['status']){
                        case true:
                        results['income_executed'] += element['value'];}
                        results['income_prediction'] += element['value'];
                    }
                });

        results['income_executed'] =  Number(results['income_executed'].toFixed(2));
        results['income_prediction'] = Number(results['income_prediction'].toFixed(2));
        results['outcome_executed'] =  Number(results['outcome_executed'].toFixed(2));
        results['outcome_prediction'] =  Number(results['outcome_prediction'].toFixed(2));

        response.status(200).json({error: false, data: results});
    })
    .catch((error) => {
        response.status(500).json({error: true, data: error.message});
    });
};

//FIND INCOMES AND OUTCOMES (PREDICTED AND EXECUTED) FROM CURRENT MONTH
exports.fetch_flux6_MONTHS = (request, response, next) => {
    let begin = moment().subtract(5, 'months').startOf('day').startOf('month');
    let end = moment().endOf('day').endOf('month');

    Transaction.find({owner: request.params.owner, date: {$gte: begin, $lte: end}})
    .select('date type value status')
    .sort({date: 1})
    .exec()
    .then((collection) => {
        let monthCounter = 0;
        let results = {
            categories: [],
            incomes: [],
            outcomes: []
        };

        if(collection[0] === undefined){
            response.status(200).json({error: false, data: results});
        } else {
            results.categories.push(moment(collection[0]['date']).format('MMM'));
            results.incomes.push(0);
            results.outcomes.push(0);

            collection.forEach((element) => {
                if(moment(element['date']).format('MMM') === results.categories[monthCounter]){
                    if(element['type'] === 1){
                        results['outcomes'][monthCounter] += element['value'];
                    } else {
                            results['incomes'][monthCounter] += element['value'];
                        }
                } else {
                    results.incomes[monthCounter] = Number(results.incomes[monthCounter].toFixed(2));
                    results.outcomes[monthCounter] = Number(results.outcomes[monthCounter].toFixed(2)) * -1;

                    results.categories.push(moment(element['date']).format('MMM'));
                    results.incomes.push(0);
                    results.outcomes.push(0);
                    monthCounter++;

                    if(element['type'] === 1){
                        results['outcomes'][monthCounter] += element['value'];
                    } else {
                            results['incomes'][monthCounter] += element['value'];
                        }       
                }
            });

        results.incomes[monthCounter] = Number(results.incomes[monthCounter].toFixed(2));
        results.outcomes[monthCounter] = Number(results.outcomes[monthCounter].toFixed(2)) * -1;

        response.status(200).json({error: false, data: results});
        }
    })
    .catch((error) => {
        response.status(500).json({error: true, data: error.message});
    });
};

//FIND INCOMES AND OUTCOMES (PREDICTED AND EXECUTED) FROM CURRENT MONTH
exports.fetch_compareLast_MONTH = (request, response, next) => {
    let begin = moment().subtract(1, 'months').startOf('day').startOf('month');
    let end = moment().endOf('day').endOf('month');

    Transaction.find({owner: request.params.owner, date: {$gte: begin, $lte: end}})
    .select('date type value status')
    .sort({date: 1})
    .exec()
    .then((collection) => {
        let monthCounter = 0;
        let results = {
            categories: [],
            incomes: [],
            outcomes: []
        };
        
        if(collection[0] === undefined){
            response.status(200).json({error: false, data: results});
        } else {
            results.categories.push(moment(collection[0]['date']).format('MMM'));
            results.incomes.push(0);
            results.outcomes.push(0);

            collection.forEach((element) => {
                if(moment(element['date']).format('MMM') === results.categories[monthCounter]){
                    if(element['type'] === 1){
                        results['outcomes'][monthCounter] += element['value'];
                    } else {
                            results['incomes'][monthCounter] += element['value'];
                        }
                } else {
                    results.incomes[monthCounter] = Number(results.incomes[monthCounter].toFixed(2));
                    results.outcomes[monthCounter] = Number(results.outcomes[monthCounter].toFixed(2));

                    results.categories.push(moment(element['date']).format('MMM'));
                    results.incomes.push(0);
                    results.outcomes.push(0);
                    monthCounter++;

                    if(element['type'] === 1){
                        results['outcomes'][monthCounter] += element['value'];
                    } else {
                            results['incomes'][monthCounter] += element['value'];
                        }       
                }
            });

        results.incomes[monthCounter] = Number(results.incomes[monthCounter].toFixed(2));
        results.outcomes[monthCounter] = Number(results.outcomes[monthCounter].toFixed(2));

        response.status(200).json({error: false, data: results});
        }
    })
    .catch((error) => {
        response.status(500).json({error: true, data: error.message});
    });
};

//FETCH 4 LAST TRANSACTIONS
exports.fetch_dashboard_last_TRANSACTION = (request, response, next) => {
    let threshold = moment().endOf('month');
    Transaction.find({owner: request.params.owner, date:{$lte: threshold}, status: true})
    .sort({date: -1})
    .limit(4)
    .exec()
    .then((collection) => {
        let results = [];

        collection.forEach(element => {
            
            if(element['type'] === 2){
                results.push({
                    type: element['type'],
                    date: moment(element['date']).format('YYYY-MM-DD'),
                    description: element['description'],
                    value: 'R$ ' + element['value'],
                    category: element['category'],
                    status: element['status'],
                    receiving: true
                });
            } else {
                results.push({
                    type: element['type'],
                    date: moment(element['date']).format('YYYY-MM-DD'),
                    description: element['description'],
                    value: 'R$ ' + element['value'],
                    category: element['category'],
                    status: element['status'],
                });
            }
        });

        response.status(200).json({error: false, data: results});
    })
    .catch((error) => {
        response.status(500).json({error: true, data: error.message});
    });
};

//FETCH PROFIT BALANCE CURRENT MONTH
exports.fetch_PROFITS = (request, response, next) => {
    let begin = request.headers.datei;
    let end = request.headers.datee;

    Transaction.find({owner: request.params.owner, date: {$gte: begin, $lte: end}})
    .select('type value status')
    .exec()
    .then((collection) => {
        let results = {
            income_prediction: 0,
            outcome_prediction: 0
        };
        
        collection.forEach((element) => {
            if(element['type'] === 1){
                    results['outcome_prediction'] += element['value'];
                } else {
                        results['income_prediction'] += element['value'];
                    }
                });

        let data = Number((results['income_prediction'] - results['outcome_prediction']).toFixed(2));

        response.status(200).json({error: false, data: data});
    })
    .catch((error) => {
        response.status(500).json({error: true, data: error.message});
    });
};

//FIND INCOMES AND OUTCOMES (PREDICTED AND EXECUTED) FROM CURRENT MONTH
exports.fetch_income_outcome_state_specific_MONTH = (request, response, next) => {
    let begin = request.headers.datei;
    let end = request.headers.datee;

    Transaction.find({owner: request.params.owner, date: {$gte: begin, $lte: end}})
    .select('type value status')
    .exec()
    .then((collection) => {
        let results = {
            income_executed: 0,
            income_prediction: 0,
            outcome_executed: 0,
            outcome_prediction: 0
        };
        
        collection.forEach((element) => {
            if(element['type'] === 1){
                switch(element['status']){
                    case true:
                    results['outcome_executed'] += element['value'];}
                    results['outcome_prediction'] += element['value'];
                } else {
                    switch(element['status']){
                        case true:
                        results['income_executed'] += element['value'];}
                        results['income_prediction'] += element['value'];
                    }
                });

        results['income_executed'] =  Number(results['income_executed'].toFixed(2));
        results['income_prediction'] = Number(results['income_prediction'].toFixed(2));
        results['outcome_executed'] =  Number(results['outcome_executed'].toFixed(2));
        results['outcome_prediction'] =  Number(results['outcome_prediction'].toFixed(2));

        response.status(200).json({error: false, data: results});
    })
    .catch((error) => {
        response.status(500).json({error: true, data: error.message});
    });
};

//FETCH LAST TRANSACTION
exports.fetch_last_TRANSACTION = (request, response, next) => {
    let threshold = moment().endOf('month');
    Transaction.find({owner: request.params.owner, date:{$lte: threshold}, status: true})
    .sort({date: -1})
    .limit(1)
    .exec()
    .then((collection) => {
        response.status(200).json({error: false, data: collection});
    })
    .catch((error) => {
        response.status(500).json({error: true, data: error.message});
    });
};

//FETCH OUTCOME NOTIFICATIONS
exports.fetch_outcome_NOTIFICATIONS = (request, response, next) => {
    let today = moment().startOf('day');
    let almostTomorrow = moment().endOf('day');

    Transaction.count({owner: request.headers.owner ,type: 1, date: {$gte: today, $lte: almostTomorrow}})
    .exec()
    .then((count) => {
        response.status(200).json({error: false, data: count});
    })
    .catch((error) => {
        response.status(500).json({error: true, data: error.message});
    });
};

//ADD A TRANSACTION INTO THE DATABASE
exports.add_TRANSACTION = (request, response, next) => {
    const transaction = new Transaction({
        _id: mongoose.Types.ObjectId(),
        type:           request.body.type,
        date:           request.body.date,
        description :   request.body.description,
        target:         request.body.target,
        value:          request.body.value,
        category:       request.body.category,
        status:         request.body.status,
        owner: mongoose.Types.ObjectId(request.body.owner),
        fixed: request.body.fixed
    });
    transaction.save()
    .then((result) => {
        response.status(201).json({error: false, data: result});
    })
    .catch((error) => {
        response.status(500).json({error: true, data: error.message});
    });
};

//UPDATE A TRANSACTION INTO THE DATABASE
exports.update_TRANSACTION = (request, response, next) => {
    Transaction.update({_id: request.params.transactionID}, {$set: request.body})
    .exec()
    .then((result) => {
        response.status(200).json({error: false, data: 'Transaction update succesfully', result: result});
    })
    .catch((error) => {
        response.status(500).json({error: false, data: error.message});
    });
};

//DELETE A TRANSACTION FROM THE BANK
exports.delete_TRANSACTION = (request, response, next) => {
    Transaction.findOneAndRemove({_id: request.body.transactionID})
    .exec()
    .then((result) => {
        response.status(200).json({error: false, data: 'Transaction removed successfully', result: result});
    })
    .catch((error) => {
        response.status(500).json({error: true, data: error.message});
    });
};