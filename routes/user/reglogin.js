const express = require('express');
const config = require('../../config.js');
const firestore = require('../../firebase/firebase').firestore();
const passport = require('passport');
const protect = require('../../auth/protect');

const router = express.Router();
const collection = firestore.collection('users');

// get user details
router.get('/', protect, (req, res) => {
    if(req.user) {
        res.json({
            status: config.statusCodes.ok,
            user: req.user
        });
    } else {
        res.json({
            status: config.statusCodes.failed,
            errorType: config.errorCodes.db,
            errors: [
                {msg: 'User Authenticated but no data'}
            ]
        });
    }
});

// post requests
router.post('/register', (req, res) => {
    let {name, email, password, password2} = req.body;
    let errors = [];

    if (!name || !email || !password || !password2){
        errors.push({ msg: 'Please enter all fields' });
    }
    if (password != password2){
        errors.push({ msg: 'Passwords do not match' });
    }
    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }
    if(!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)){
        errors.push({msg: 'Invalid Email format!'});
    }

    if(errors.length > 0){
        res.status(422).json({
            status: config.statusCodes.failed,
            errorType: config.errorCodes.api,
            errors
        });
    }else{
        let user = {
            name,
            email,
            password
        };

        
        collection.where('email', '==', email).get()
        .then(snapshot => {
            let matches = [];
            snapshot.forEach(doc => matches.push(doc.data()));
            return matches;
        })
        .then(matches => {
            if(matches.length === 0){
                collection.add(user);
                console.log(`${user.email} was registered!`);
                res.json({
                    status: config.statusCodes.ok,
                    user
                });
            }else if(matches.length === 1){
                errors.push({ msg: 'User already exists' });
                res.status(422).json({
                    status: config.statusCodes.failed,
                    errorType: config.errorCodes.api,
                    errors,
                    user
                });
            }else{
                res.json({
                    status: config.statusCodes.failed,
                    errorType: config.errorCodes.db,
                    errors: [
                        {msg: 'Inconsistent Database'}
                    ]
                });
            }
        })
        .catch(err => {
            console.log(`Registeration failed:`, err);
            res.json({
                status: config.statusCodes.failed,
                errorType: config.errorCodes.internal,
                errors: [
                    {msg: 'Unexpected Error', error: err}
                ]
            });
        });
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, errors) => {
        // err => internal server error
        // errors => reasons why the authentication failed
        if(err){
            console.log(err);
            return next(user);
        }
        if(!user){
            return res.status(401).json({
                status: config.statusCodes.failed, 
                errorType: config.errorCodes.auth,
                errors
            });
        }else{
            req.logIn(user, err => {
                if(err){
                    return next(err);
                }else{
                    req.session.save(() => {
                        res.json({
                            status: config.statusCodes.ok,
                            user
                        });
                    });
                }
            });
        }
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logOut();
    req.session.destroy();
    res.json({
        status: config.statusCodes.ok,
        msg: 'Logged Out'
    });
});

module.exports = router;