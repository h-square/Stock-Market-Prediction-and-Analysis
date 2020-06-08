const express = require('express');
const jwt = require('jsonwebtoken');
const firestore = require('../../../firebase/firebase').firestore();
const nodemailer = require('nodemailer');
const config = require('../../../config');
const router = express.Router();

const portfolios = firestore.collection('portfolios');
const sharedPortfolios = firestore.collection('sharedPortfolios');
const sharedList = firestore.collection('sharedList');
const auth = require('./smapgmail');


router.post('/', (req, res) => {
    const {reqFrom, reqTo, portfolioName} = req.body;
    const payload = {reqFrom, reqTo, portfolioName};

    if(!reqFrom || !reqTo || !portfolioName) {
        let errors = [];
        if(!reqFrom){
            errors.push({msg: 'reqFrom is undefined'});
        }
        if(!reqTo){
            errors.push({msg: 'reqTo is undefined'});
        }
        if(!portfolioName){
            errors.push({msg: 'portfolioName is undefined'});
        }
        res.json({
            status: config.statusCodes.failed,
            errorType: config.errorCodes.api,
            errors
        });
        return;
    };

    if(!req.user || !(req.user.email==reqFrom)|| (reqTo==reqFrom)){
        res.json({
            status: config.statusCodes.failed,
            errorType: config.errorCodes.auth,
            errors: [
                {msg: 'Invalid requester.'}
            ]
        });
        return;
    }

    //check if requested-porfolio exist 
    portfolios.where('email', '==', reqTo).get()
    .then(snapshot => {
        if(snapshot.empty) {
            res.json({
                status: config.statusCodes.failed,
                errorType: config.errorCodes.api,
                errors: [
                    {msg: `Requested user doesn't exist or has no portfolios.`}
                ]
            });
        }
        else if(snapshot.size != 1) {
            res.json({
                status: config.statusCodes.failed,
                errorType: config.errorCodes.db,
                errors: [
                    {msg: 'Inconsistent Database (Multiple users)'}
                ]
            });
        }
        else {
            snapshot.forEach(user => {
                let portfolio = user.data().portfolios.find(portfolio => portfolio.name == portfolioName);

                if( portfolio ) {
                    sharedList.where('owner', '==', reqTo).where('receiver', '==', reqFrom).where('name', '==', portfolioName).get()
                    .then(snapshot=>{
                        if(snapshot.empty){
                            jwt.sign(payload,
                                config.keys.jwt,
                                {expiresIn: 60*60*24},  //24-hours validity
                                (err, token) => {
                                    if(err) {
                                        res.json({msg: 'Token not generated'});
                                    };
                                    
                                    // change before deploying
                                    const LINK = `http://localhost:5000/user/shareportfolio?token=${token}`;
                                    const message = require('./message').shareRequest;
                            
                                    let transporter = nodemailer.createTransport({
                                        service : 'gmail',
                                        auth,
                                        tls: {
                                          rejectUnauthorized: false
                                        }
                                    });
                                    
                                    let mailOptions = {
                                        from: '"Stock Market Analysis and Prediction" <noreply.smap@gmail.com>',
                                        to: reqTo,
                                        subject: "[TEST Mail] Your Portfolio Request",
                                        html: message(reqTo, reqFrom, portfolioName, LINK)
                                    };
                            
                                    transporter.sendMail(mailOptions, (err, info) => {
                                        if(err) {
                                            console.log('Mail failed!');
                                            throw 'nodemailer failed!';
                                        }
                                        else {
                                            console.log(`Portfolio Request from: ${reqTo} by ${reqFrom}`);
                                            sharedList.add({
                                                owner: reqTo,
                                                receiver: reqFrom,
                                                timestamp: Date.now(),
                                                granted: false,
                                                name: portfolioName,
                                            });
                                            res.json({
                                                status: config.statusCodes.ok,
                                                msg: 'Please ask the user to grant you access.'
                                            });
                                        }                                 
                                    });
                                });
                        }
                        else{
                            res.json({
                                status: config.statusCodes.failed,
                                errorType: config.errorCodes.api,
                                errors: [
                                    {msg: 'User has already made such a request.'}
                                ]
                            });
                        }
                    });
                }
                else {
                    res.json({
                        status: config.statusCodes.failed,
                        errorType: config.errorCodes.api,
                        errors: [
                            {msg: 'No such requested portfolio exists'}
                        ]
                    });
                };
            });
        };
    })
    .catch(err => {
        console.log(`shareRequest failed: `, err);
        res.json({
            status: config.statusCodes.failed,
            errorType: config.errorCodes.internal,
            errors: [
                {msg: 'Unexpected Error', error: err}
            ]
        });
    }); 
});

module.exports = router;



