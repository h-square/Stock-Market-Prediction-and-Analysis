const express = require('express');
const config = require('../../config.js');
const axios = require('axios');
const firestore = require('../../firebase/firebase').firestore();

const router = express.Router();
const collection = firestore.collection('prices');
const stocksdb = require('../../firebase/stocks');

router.get('/:symbol', (req, res) => {
    symbol = req.params.symbol.trim().toUpperCase();

    if((config.useAlphavantage || !config.useFirestore) && !stocksdb.has(symbol)){
        res.json({
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
        // fetch the data from the database but since
        // we don't have one right now we use alphavantage
        axios({
            url: "https://www.alphavantage.co/query",
            method: "get",
            params: {
                function: "TIME_SERIES_DAILY",
                symbol,
                outputsize: "full",
                apikey: config.keys.alphavantage
            }
        })
        .then(res_av => {
            // extract the data
            data = res_av.data;
            if( !('Time Series (Daily)' in data)){
                res.json({
                    status: config.statusCodes.failed,
                    errorType: config.errorCodes.internal,
                    errors: [
                        {msg: 'Alphavantage Refused or Moved'}
                    ]
                });
                return;
            }
            data = data['Time Series (Daily)'];
            
            const timestamp = [];
            const prices = [];

            // format the data as defined by the API
            // in this case it is status of request, timestamps and prices
            // the client can generate a simple plot locally
            Object.keys(data).forEach(date => {
                timestamp.push(date);
                prices.push(parseFloat(data[date]['1. open']));
            });

            // send the proper response
            res.json({
                status: config.statusCodes.ok,
                timestamp,
                prices
            });

        })
        .catch(err => {
            // the above .then code could generate error
            // we can inspect the error and do different tasks
            // but here we don't
            console.log(`GET (prices) failed: ${symbol}:`, err);
            res.json({
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
        .where('year', '>=', config.earliestYear)
        .get().then(snapshot => {
            let timestamp = [];
            let prices = [];
            if(snapshot.empty){
                res.json({
                    status: config.statusCodes.failed,
                    errorType: config.errorCodes.db,
                    errors: [
                        {msg: `Database doesn't have relevant data`}
                    ]
                });
            } else {
                snapshot.forEach(doc => {
                    doc.data().data.forEach(dataPoint => {
                        timestamp.push(dataPoint.date);
                        prices.push(dataPoint.price);
                    });
                })
                res.json({
                    status: config.statusCodes.ok,
                    timestamp,
                    prices
                });
            }
        })
        .catch(err => {
            console.log(`GET (prices) failed: ${symbol}-${period}:`, err);
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

module.exports = router;