//EXPRESS SERVER DECLARATION
const express = require('express');
const router = express.Router();
//MIDDLEWARE IMPORTING
const jwt = require('jsonwebtoken');
// ------ ROUTES DECLARATION ------ //

//#region JWT ROUTES

//-------------------- CHECK JWTS
router.route('/')
    .get((request, response) => {
    try {
        const token = request.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        request.userData = decoded;
        const newToken = jwt.sign(
            {
              userID: request.userData['userID']
            },
            process.env.SECRET_KEY,
            {
              algorithm: 'HS256',
              expiresIn: 1200
            });

        return response.status(200).json({
            message: "Auth OK",
            token: newToken,
            expiresIn: '1200'
        })
    } catch (error) {
        return response.status(401).json({
            message: "Auth Failed!"
        });
    }
});

//#endregion

//ROUTES EXPORTING
  module.exports = router;