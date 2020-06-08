const express = require('express');
const config = require('../../config.js');
const axios = require('axios');
const firestore = require('../../firebase/firebase').firestore();

const router = express.Router();
const collection = firestore.collection('reports');
const stocksdb = require('../../firebase/stocks');

router.get('/:symbol-:year', (req, res) => {
    const symbol = req.params.symbol.trim().toUpperCase();

    if(isNaN(req.params.year) || parseInt(req.params.year) < 2000 || parseInt(req.params.year) > 3000){
        res.json({
            status: config.statusCodes.failed,
            errorType: config.errorCodes.api,
            errors: [
                {msg: "Invalid Year"}
            ]
        });
        return;
    }
    const year = parseInt(req.params.year);

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

    if(config.useFmprep || !config.useFirestore)
    {
        let url_income = 'https://financialmodelingprep.com/api/'+
                'v3/financials/income-statement/'+
                `${symbol}`;
        let url_balance = 'https://financialmodelingprep.com/api/'+
                'v3/financials/balance-sheet-statement/'+
                `${symbol}`;
        let url_cash = 'https://financialmodelingprep.com/api/'+
                'v3/financials/cash-flow-statement/'+
                `${symbol}`;
        
        let income_statement = axios.get(url_income)
        .then(res_fmprep => {
            let data = res_fmprep.data;
            let result = {};
            if(!data.financials){
                throw 'Financial Modeling Prep Refused or Moved';
            }else{
                for(let i=0; i<data.financials.length; i++)
                {
                    rep_year = parseInt(data.financials[i].date.split('-')[0]);
                    if(rep_year === year)
                    {
                        Object.keys(data.financials[i])
                        .forEach(key => {
                            if(key !== 'date')
                                result[key] = parseFloat(data.financials[i][key]);
                        });

                        return result;
                    }
                }
            }
            return {};
        })
        .catch(err => {
            throw err;
        });

        let balance_statement = axios.get(url_balance)
        .then(res_fmprep => {
            let data = res_fmprep.data;
            let result = {};
            if(!data.financials){
                throw 'Financial Modeling Prep Refused or Moved';
            }else{
                for(let i=0; i<data.financials.length; i++)
                {
                    rep_year = parseInt(data.financials[i].date.split('-')[0]);
                    if(rep_year === year)
                    {
                        Object.keys(data.financials[i])
                        .forEach(key => {
                            if(key !== 'date')
                                result[key] = parseFloat(data.financials[i][key]);
                        });
                        
                        return result;
                    }
                }
            }
            return {};
        })
        .catch(err => {
            throw err;
        });

        let cash_statement = axios.get(url_cash)
        .then(res_fmprep => {
            let data = res_fmprep.data;
            let result = {};
            if(!data.financials){
                throw 'Financial Modeling Prep Refused or Moved';
            }else{
                for(let i=0; i<data.financials.length; i++)
                {
                    rep_year = parseInt(data.financials[i].date.split('-')[0]);
                    if(rep_year === year)
                    {
                        Object.keys(data.financials[i])
                        .forEach(key => {
                            if(key !== 'date')
                                result[key] = parseFloat(data.financials[i][key]);
                        });
                        
                        return result;
                    }
                }
            }
            return {};
        })
        .catch(err => {
            throw err;
        });

        Promise.all([income_statement, balance_statement, cash_statement])
        .then(values => {
            let final = {status: config.statusCodes.ok, symbol, year};
            if(Object.keys(values[0]).length > 0)
                final.income_statement = values[0];
            else{
                throw 'Financial Modeling Prep Refused or Moved';
            }
            
            if(Object.keys(values[1]).length > 0)
                final.balance_statement = values[1];
            else{
                throw 'Financial Modeling Prep Refused or Moved';
            }
            
            if(Object.keys(values[2]).length > 0)
                final.cash_statement = values[2];
            else{
                throw 'Financial Modeling Prep Refused or Moved';
            }

            res.json(final);
        })
        .catch(err => {
            console.log(`GET (report) failed: ${symbol}-${year}:`, err);
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
        .where('year', '==', year)
        .get().then(snapshot => {
            let matches = [];
            if(snapshot.empty){
                res.json({
                    status: config.statusCodes.failed,
                    errorType: config.errorCodes.db,
                    errors: [
                        {msg: `Database doesn't have relevant data`}
                    ]
                });
            } else {
                snapshot.forEach(doc => matches.push(doc.data()));

                let income_statement = matches[0].income_statement;
                let balance_statement = matches[0].balance_statement;
                let cash_statement = matches[0].cash_statement;

                if(matches.length == 1) {
                    res.status(200).json({
                        status: config.statusCodes.ok, symbol, year,
                        income_statement,
                        balance_statement,
                        cash_statement
                    });
                } else {
                    res.json({
                        status: config.statusCodes.failed,
                        errorType: config.errorCodes.db,
                        errors: [
                            {msg: `Database Inconsistent`}
                        ]
                    });
                }
            }
        })
        .catch(err => {
            console.log(`GET (report) failed: ${symbol}-${year}:`, err);
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