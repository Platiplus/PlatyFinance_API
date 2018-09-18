//DEPENDENCIES
const mongoose = require('mongoose');

//MODEL IMPORTING
const User = require('../models/user_model');
const Balance = require('../models/balance_model');

//AUTHENTICATION REQUIREMENTS
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//METHODS DECLARATION

//FIND ALL USERS ON THE DATABASE
exports.fetch_all_USERS = (request, response, next) => {
    User.find()
    .select('username email')
    .exec()
    .then((collection) => {
        response.status(200).json({error: false, data: collection});
    })
    .catch((error) => {
        response.status(500).json({error: true, data: error.message});
    });
};

//FIND USER BY IT'S ID ON THE DATABASE
exports.fetch_user_by_ID = (request, response, next) => {
    User.findById(request.params.userID)
        .exec()
        .then((document) => {
            if(document){
                response.status(200).json({error: false, data: document});
            } else {
                response.status(404).json({error: false, data: 'User doesn\'t exist'});
            }
        })
        .catch((error) => {
            response.status(500).json({error: true, data: error.message});
        });
};

//USER LOGIN
exports.login_USER = (request, response, next) => {
    User.findOne({email: request.body.email})
        .exec()
        .then((document) => {
            if(document){
                let owner = document['_id'];
                bcrypt.compare(request.body.password, document.password, (error, result) => {
                    if (error) {
                      return response.status(401).json({
                        message: "Auth Failed!"
                      });
                    }
                    if (result) {
                        const token = jwt.sign(
                          {
                            userID: document['_id']
                          },
                          process.env.SECRET_KEY,
                          {
                            algorithm: 'HS256',
                            expiresIn: 1200
                          });
                        return response.status(200).json({
                          message: "Auth Successful!",
                          token: token,
                          expiresIn: '1200',
                          owner: owner
                        });
                      }
                      response.status(401).json({error: true, data: 'Auth Failed'});
                })
            } else {
                response.status(401).json({error: true, data: 'Auth Failed'});
            }
        })
        .catch((error) => {
            response.status(500).json({error: true, data: error.message});
        });
};

//CREATE A NEW USER ON THE DATABASE
exports.create_USER = (request, response, next) => {
    User.findOne({email: request.body.email})
        .exec()
        .then((document) => {
            console.log(document);
            if(!document){
                let salt = bcrypt.genSaltSync(10);
                let hash = bcrypt.hashSync(request.body.password, salt);

                const user = new User({
                    _id: mongoose.Types.ObjectId(),
                    username: request.body.username,
                    password: hash,
                    email: request.body.email,
                    initialBalance: request.body.initialBalance
                });
            console.log(user);
                const balance = new Balance({
                    _id: mongoose.Types.ObjectId(),
                    owner: user['_id'],
                    balance: user['initialBalance']
                });
            
                user.save()
                    .then((result) => {
                        balance.save();
                        response.status(201).json({ message: 'User Created succesfully!', data: result});
                    })
            } else {
                response.status(500).json({error: true, message: 'User Already Exists'});
            }
        })
        .catch((error) => {
            response.status(500).json({message: 'User was not created', error: error.message});
        });
};

//DELETE AN USER FROM THE DATABASE
exports.delete_USER = (request, response, next) => {
    User.remove({_id: request.params.userID})
    .exec()
    .then((result) => {
        response.status(200).json({error: false, data: result});
    })
    .catch((error) => {
        response.status(500).json({error: true, data: error.message});
    });
};

//UPDATE AN USER FROM THE DATABASE
exports.update_USER = (request, response, next) => {
    const updateOperations = {};
    
    for (const operations of request.body){
        updateOperations[operations.propertyName] = operations.value;
    }

    User.update({_id: request.params.userID}, {$set: updateOperations})
    .exec()
    .then((result) => {
        response.status(200).json({error: false, data: result});
    })
    .catch((error) => {
        response.status(500).json({error: true, data: error.message});
    })
};