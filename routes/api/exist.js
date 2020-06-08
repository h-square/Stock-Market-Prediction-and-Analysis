const express = require('express');
const config = require('../../config.js');

const router = express.Router();
const stocksdb = require('../../firebase/stocks');


router.get('/:symbol', (req, res) => {
    symbol = req.params.symbol.trim().toUpperCase();

    try {
        if(stocksdb.has(symbol)){
            res.json({
                status: config.statusCodes.ok,
                msg: 'Valid Ticker',
                symbol
            });
        } else {
            res.json({
                status: config.statusCodes.ok,
                msg: 'Invalid Ticker'
            })
        }
    } catch (err) {
        console.log(`GET (exist) failed: ${err}`);
        res.json({
            status: config.statusCodes.failed,
            errorType: config.errorCodes.internal,
            errors: [
                {msg: 'Unexpected Error', error: err}
            ]
        });
    }
});


module.exports = router;