const express = require('express');
const config = require('../../config.js');
const axios = require('axios');
const firestore = require('../../firebase/firebase').firestore();

const router = express.Router();
const collection = firestore.collection('quotes');
const stocksdb = require('../../firebase/stocks');

router.get('/:symbol', (req, clientres) => {
    symbol = req.params.symbol.trim().toUpperCase();

    if((config.useAlphavantage || !config.useFirestore) && !stocksdb.has(symbol)){
        clientres.json({
            status: config.statusCodes.failed,
            errorType: config.errorCodes.api,
            errors: [
                {msg: "Invalid Symbol"}
            ]
        });
        return;
    }

    if(config.useAlphavantage || !config.useFirestore)
    {
        axios({
            url: 'http://www.alphavantage.co/query',
            method: 'get',
            params: {
                function: 'GLOBAL_QUOTE',
                symbol,
                apikey: config.keys.alphavantage
            }
        })
        .then(res => {
            // if request fails or api has bad data
            if(res.status !== 200){
                throw `Alphavantage Refused or Moved`;
            } else {
                if(res.data['Global Quote']){
                    return res.data['Global Quote'];
                } else {
                    throw 'Alphavantage Refused or Moved';
                }
            }
        })
        .then(data => {
            clientres.json({
                status: config.statusCodes.ok,
                symbol: data['01. symbol'],
                open: parseFloat(data['02. open']),
                high: parseFloat(data['03. high']),
                low: parseFloat(data['04. low']),
                price: parseFloat(data['05. price']),
                volume: parseFloat(data['06. volume']),
                lastTradingDay: data['07. latest trading day'],
                previousClose: parseFloat(data['08. previous close']),
                change: parseFloat(data['09. change']),
                changePercent: parseFloat(data['10. change percent'].slice(0, -1))
            });
        })
        .catch(err => {
            console.log(`GET (quote) failed: ${symbol}:`, err);
            clientres.json({
                status: config.statusCodes.failed,
                errorType: config.errorCodes.internal,
                errors: [
                    {msg: 'Unexpected Error', error: err}
                ]
            });
        });
    }
    else
    {   
        collection.where('symbol', '==', symbol)
        .get().then(snapshot => {
            if(snapshot.empty){
                clientres.json({
                    status: config.statusCodes.failed,
                    errorType: config.errorCodes.db,
                    errors: [
                        {msg: `Database doesn't have relevant data`}
                    ]
                });
            } else {
                if(snapshot.size != 1){
                    clientres.json({
                        status: config.statusCodes.failed,
                        errorType: config.errorCodes.db,
                        errors: [
                            {msg: `Database inconsistent`}
                        ]
                    });
                } else {
                    snapshot.forEach(doc => {
                        let data = doc.data();
                        data.status = config.statusCodes.ok;
                        clientres.json(data);
                    })
                }
            }
        })
        .catch(err => {
            console.log(`GET (quote) failed: ${symbol}:`, err);
            clientres.json({
                status: config.statusCodes.failed,
                errorType: config.errorCodes.internal,
                errors: [
                    {msg: 'Unexpected Error', error: err}
                ]
            });
        });
    }
});

module.exports = router;