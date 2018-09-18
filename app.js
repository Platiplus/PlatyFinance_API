//DEPENDENCIES
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

//ROUTES IMPORTING
const userRoutes = require('./api/routes/users_routes');
const transactionRoutes = require('./api/routes/transactions_routes');
const balanceRoutes = require('./api/routes/balance_routes');
const jwtRoutes = require('./api/routes/checkJWT');

//MIDDLEWARES
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

//ROUTES DECLARATION
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/balance', balanceRoutes);
app.use('/api/checkJWT', jwtRoutes);

//DB CONNECTION
mongoose.connect('mongodb+srv://'+ process.env.DB_USER +':'+ process.env.DB_PWD +'@' + process.env.DB_SRV + process.env.DB_OPTIONS);

//ERROR 404 HANDLING
app.use((request, response, next) => {
    const error = new Error('Route not found');
    error.status = 404;
    next(error);
});

//GENERIC ERROR HANDLING
app.use((error, request, response, next) => {
    response.status(error.status || 500);
    response.json({
        error: {
            message: error.message
        }
    });
});

//APP EXPORTING
module.exports = app;