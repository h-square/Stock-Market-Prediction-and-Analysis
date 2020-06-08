const express = require('express');
const config = require('../../../config.js');
const axios = require('axios');
const firestore = require('../../../firebase/firebase').firestore();

const router = express.Router();
const collection = firestore.collection('indicators-sma');
const stocksdb = require('../../../firebase/stocks');

const supportedPeriods = [50, 100];

router.get('/:symbol-:period', (req, res) => {
    const symbol = req.params.symbol.trim().toUpperCase();
    const period = req.params.period;

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

    if(isNaN(period) || !supportedPeriods.includes(parseInt(period))){
        res.json({
            status: config.statusCodes.failed,
            errorType: config.errorCodes.api,
            errors: [
                {msg: "Invalid Period"}
            ]
        });
        return;
    }
    
    if(config.useAlphavantage || !config.useFirestore)
    {   
        axios({
            url: "https://www.alphavantage.co/query",
            method: "get",
            params: {
                function: "sma",
                symbol,
                interval: "daily",
                time_period: period,
                series_type: "open",
                apikey: config.keys.alphavantage
            }
        })
        .then(res_av => {
            data = res_av.data;
            if( !('Technical Analysis: SMA' in data)){
                res.json({
                    status: config.statusCodes.failed,
                    errorType: config.errorCodes.internal,
                    errors: [
                        {msg: 'Alphavantage Refused or Moved'}
                    ]
                });
                return;
            }
            data = data['Technical Analysis: SMA'];
            
            const timestamp = [];
            const analysis_data = [];
            Object.keys(data).forEach(date => {
                timestamp.push(date);
                analysis_data.push(parseFloat(data[date]['SMA']));
            });
            //console.log(timestamp, sma_data);
            res.json({
                status: config.statusCodes.ok,
                timestamp,
                analysis_data
            });
        })
        .catch(err => {
            console.log(`GET (SMA) failed: ${symbol}-${period}:`, err);
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
        .where('period', '==', parseInt(period))
        .where('year', '>=', config.earliestYear)
        .get().then(snapshot => {
            let timestamp = [];
            let analysis_data = [];
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
                        analysis_data.push(dataPoint.sma);
                    });
                });
                res.json({
                    status: config.statusCodes.ok,
                    timestamp,
                    analysis_data
                });
            }
        })
        .catch(err => {
            console.log(`GET (SMA) failed: ${symbol}-${period}:`, err);
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