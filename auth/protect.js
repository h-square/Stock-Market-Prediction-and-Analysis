const config = require('../config');

function protect(req, res, next){
    // console.log('protect function is authenticated? =>', req.isAuthenticated());
    if(req.isAuthenticated()){
        return next();
    }else{
        res.status(401).json({
            status: config.statusCodes.failed,
            errorType: config.errorCodes.auth,
            errors: [
                {msg: 'Bad Credentials'}
            ]
        });
    }
};

module.exports = protect;

