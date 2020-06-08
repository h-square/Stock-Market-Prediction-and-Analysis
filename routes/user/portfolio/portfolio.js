const express = require('express');
const firestore = require('../../../firebase/firebase').firestore();
const config = require('../../../config');

const router = express.Router();
const portfolios = firestore.collection('portfolios');
const sharedPortfolios = firestore.collection('sharedPortfolios');
const sharedList = firestore.collection('sharedList');
const quotes = firestore.collection('quotes');
const stocksdb = require('../../../firebase/stocks');

// portfolio structure
// p1 = {
//     name: 'portfolio top secret',
//     items: [
//         {
//             symbol: 'MSFT',
//             price: 546.23,
//             quantity: 50
//         },
//         {
//             symbol: 'FB',
//             quantity: 23 // if price is not mentioned then latest quote will be added
//         }
//     ]
// }


// get all portfolios for the user
router.get('/', (req, res) => {
    if(!req.user){
        res.json({
            status: config.statusCodes.failed,
            errorType: config.errorCodes.auth,
            errors: [
                {msg: 'Authenticated but user not Found'}
            ]
        });
        return;
    }

    portfolios.where('email', '==', req.user.email).get()
    .then(snapshot => {
        if(snapshot.empty){
            res.json({
                status: config.statusCodes.ok,
                portfolios: []
            });
            portfolios.add({
                email: req.user.email,
                portfolios: []
            });
        } else if(snapshot.size != 1){
            res.json({
                status: config.statusCodes.failed,
                errorType: config.errorCodes.db,
                errors: [
                    {msg: 'Inconsistent Database (Multiple users)'}
                ]
            });
        } else {
            snapshot.forEach(doc => {
                res.json({
                    status: config.statusCodes.ok,
                    portfolios: doc.data().portfolios
                });
            });
        }
    })
    .catch(err => {
        console.log('Portfolios (All) get failed:', err);
        res.json({
            status: config.statusCodes.failed,
            errorType: config.errorCodes.internal,
            errors: [
                {msg: 'Unexpected Error', error: err}
            ]
        });
    });;
});


//a particular shared portfolio by name and owner email

router.post('/specificPort', (req,res) =>{
    if(!req.user){
        res.json({
            status: config.statusCodes.failed,
            errorType: config.errorCodes.auth,
            errors: [
                {msg: 'Authenticated but user not Found'}
            ]
        });
        return;
    }

    let portName=req.body.portName;
    let owner=req.body.owner;

    if(!portName || !owner) {
        let errors = [];
        if(!portName){
            errors.push({msg: 'Portfolio name is undefined'});
        }
        if(!owner){
            errors.push({msg: 'Owner of the portfolio is undefined'});
        }
        res.json({
            status: config.statusCodes.failed,
            errorType: config.errorCodes.api,
            errors
        });
        return;
    };

    sharedList.where('owner','==', owner).where('name', '==', portName).get()
    .then(query=>{
        if(query.empty){
            res.json({
                status: config.statusCodes.failed,
                errorType: config.errorCodes.auth,
                errors: [
                    {msg: 'You need to send a request for access first.'}
                ]
            });
        }
        else if(query.size!=1){
            res.json({
                status: config.statusCodes.failed,
                errorType: config.errorCodes.auth,
                errors: [
                    {msg: 'Error in database.'}
                ]
            });
        }
        else{
            query.forEach(doc=>{
                if(doc.data().granted==false){
                    res.json({
                        status: config.statusCodes.failed,
                        errorType: config.errorCodes.auth,
                        errors: [
                            {msg: 'The request for access hasnt been granted yet.'}
                        ]
                    });
                }
                else{
                    portfolios.where('email', '==', owner).get()
                    .then(query2=>{
                        if(query2.empty){
                            res.json({
                                status: config.statusCodes.failed,
                                errorType: config.errorCodes.db,
                                errors: [
                                    {msg: 'The specified owner is not a user or does not have a portfolio.'}
                                ]
                            });
                        }
                        else if(query2.size!=1){
                            res.json({
                                status: config.statusCodes.failed,
                                errorType: config.errorCodes.db,
                                errors: [
                                    {msg: 'Error in database.'}
                                ]
                            });
                        }
                        else{
                            query2.forEach(doc2=>{
                                doc2data=doc2.data();
                                let exists = false;
                                var reqPortfolio={};
                                for(let i=0; i<doc2data.portfolios.length; i++){
                                    if(doc2data.portfolios[i].name==portName){
                                        exists=true;
                                        reqPortfolio=doc2data.portfolios[i];
                                        break;
                                    }
                                }
                                if(!exists){
                                    res.json({
                                        status: config.statusCodes.failed,
                                        errorType: config.errorCodes.db,
                                        errors: [
                                            {msg: 'The owner may have deleted the required portfolio since the request was made.'}
                                        ]
                                    });
                                }
                                else{
                                    res.json({
                                        name: reqPortfolio.name,
                                        items: reqPortfolio.items,
                                    });
                                }
                            })
                        }
                    })
                }
            })
        }
    })
    .catch(err => {
        console.log('Portfolios (All) get failed:', err);
        res.json({
            status: config.statusCodes.failed,
            errorType: config.errorCodes.internal,
            errors: [
                {msg: 'Unexpected Error', error: err}
            ]
        });
    });;

});


//get all the shared portfolios
router.get('/shared', (req, res) => {
    if(!req.user){
        res.json({
            status: config.statusCodes.failed,
            errorType: config.errorCodes.auth,
            errors: [
                {msg: 'Authenticated but user not Found'}
            ]
        });
        return;
    }

    let email=req.user.email;
    


    sharedList.where('receiver','==', email).where('granted','==',true).get()
    .then(query=>{
        if(query.empty){
            res.json({
                status: config.statusCodes.failed,
                errorType: config.errorCodes.auth,
                errors: [
                    {msg: 'User has no shared portfolios.'}
                ]
            });
        }
        else{
            var reqs=query.docs;
            var errs=[];
            var ports=[];
            for(let i=0; i<reqs.length; i++){
                var done=0;
                portfolios.where('email','==', reqs[i].data().owner).get()
                .then((query2)=>{
                    done=done+1;
                    if(query2.empty){
                        errs.push(`owner ${reqs[i].data().owner} of portfolio ${reqs[i].data().name} not found having portfolios. Entry deleted from sharedList`);
                        sharedList.doc(reqs[i].id).delete();
                    }
                    else if(query2.size>1){
                        errs.push(`Database inconsistent for owner ${reqs[i].data().owner} of portfolio ${reqs[i].data().name} .Entry deleted from sharedList`);
                        sharedList.doc(req[i].id).delete();
                    }
                    else{
                        var req2=query2.docs;
                        for(let j=0; j<req2.length; j++){
                            let portfolio = req2[j].data().portfolios.find(portfolio => portfolio.name == reqs[i].data().name);
                            if(portfolio){
                                ports.push(portfolio);
                            }
                            else{
                                errs.push(`owner ${reqs[i].data().owner} doesnt have a portfolio ${reqs[i].data().name} not found. Entry deleted from sharedList`);
                                sharedList.doc(reqs[i].id).delete();
                            }
                        }
                    } 
                    if(done==reqs.length){
                        res.json({
                            ports,
                            errs
                        })
                    }    
                })          
            }
        }
    })   
});




// add a portfolio for the user
router.post('/add', (req, res) => {
    if(!req.user){
        res.json({
            status: config.statusCodes.failed,
            errorType: config.errorCodes.auth,
            errors: [
                {msg: 'Authenticated but user not Found'}
            ]
        });
        return;
    }

    const data = req.body.portfolio;
    if(!data){
        res.json({
            status: config.statusCodes.failed,
            errorType: config.errorCodes.api,
            errors: [
                {msg: 'No portfolio found in request'}
            ]
        });
        return;
    }

    const errors = [];
    if(!data.name){
        errors.push({msg: 'Portfolio has no name!'});
    }
    if(!(data.items instanceof Array)){
        errors.push({msg: 'Portfolio has no items array!'});
    }
    if(errors.length > 0){
        res.json({
            status: config.statusCodes.failed,
            errorType: config.errorCodes.api,
            errors
        });
        return;
    }

    const portfolio = {
        name: data.name,
        items: []
    };
    const promises = [];
    for(let i=0; i<data.items.length; i++){
        let {symbol, price, quantity} = data.items[i];

        // item has no proper symbol
        if(!stocksdb.has(symbol)){
            res.json({
                status: config.statusCodes.failed,
                errorType: config.errorCodes.api,
                errors: [
                    {msg: `Item index ${i} has no valid symbol`}
                ]
            });
            return;
        }

        // item has no quantity present
        if(!quantity || isNaN(quantity) || quantity <= 0){
            res.json({
                status: config.statusCodes.failed,
                errorType: config.errorCodes.api,
                errors: [
                    {msg: `Item index ${i} has no valid quantity`}
                ]
            });
            return;
        }

        // price is present but not valid
        if(price && (isNaN(price) || price < 0) ){
            res.json({
                status: config.statusCodes.failed,
                errorType: config.errorCodes.api,
                errors: [
                    {msg: `Item index ${i} has no valid price`}
                ]
            });
            return;
        } else { // price is absent, bring from quote
            if(!price){
                portfolio.items.push({
                    symbol,
                    quantity
                });
                promises.push(quotes.where('symbol', '==', symbol).get()
                .then(snapshot => {
                    if(snapshot.size != 1){
                        res.json({ // inconsistent database
                            status: config.statusCodes.failed,
                            errorType: config.errorCodes.db,
                            errors: [
                                {msg: `Item index ${i} is valid but (none/multiple) quotes`}
                            ]
                        });
                    } else { // assign price
                        snapshot.forEach(doc => {
                            portfolio.items[i].price = doc.data().price;
                        });
                    }
                }));
            } else {
                portfolio.items.push({
                    symbol,
                    quantity,
                    price
                });
                promises.push('Price was present');
            }
            
        }
    }

    Promise.all(promises)
    .then(values => {
        portfolios.where('email', '==', req.user.email).get()
        .then(snapshot => {
            if(snapshot.empty){
                portfolios.add({
                    email: req.user.email,
                    portfolios: [portfolio]
                })
                .then(() => {
                    res.json({
                        status: config.statusCodes.ok,
                        msg: `Portfolio ${portfolio.name} added!`
                    });
                });
            } else if(snapshot.size > 1){
                res.json({ // inconsistent database
                    status: config.statusCodes.failed,
                    errorType: config.errorCodes.db,
                    errors: [
                        {msg: `Multiple users found! (Inconsistent database)`}
                    ]
                });
            } else {
                snapshot.forEach(doc => {
                    const userData = doc.data();

                    for(let i=0; i<userData.portfolios.length; i++){
                        // check for duplicate portfolio names
                        if(userData.portfolios[i].name == portfolio.name){
                            res.json({
                                status: config.statusCodes.failed,
                                errorType: config.errorCodes.api,
                                errors: [
                                    {msg: `Portfolio ${portfolio.name} already exists!`}
                                ]
                            });
                            return;
                        }
                    }

                    userData.portfolios.push(portfolio);
                    portfolios.doc(doc.id).set(userData)
                    .then(() => {
                        res.json({
                            status: config.statusCodes.ok,
                            msg: `Portfolio ${portfolio.name} added!`
                        });
                    });
                });
            }
        })
    })
    .catch(err => {
        console.log('Portfolio add failed:', err);
        res.json({
            status: config.statusCodes.failed,
            errorType: config.errorCodes.internal,
            errors: [
                {msg: 'Unexpected Error', error: err}
            ]
        });
    });

});

// remove a portfolio
router.post('/remove', (req, res) => {
    if(!req.user){
        res.json({
            status: config.statusCodes.failed,
            errorType: config.errorCodes.auth,
            errors: [
                {msg: 'Authenticated but user not Found'}
            ]
        });
        return;
    }

    const portfolioName = req.body.name;
    if(!portfolioName){
        res.json({
            status: config.statusCodes.failed,
            errorType: config.errorCodes.api,
            errors: [
                {msg: 'No portfolioName found in request'}
            ]
        });
        return;
    }

    portfolios.where('email', '==', req.user.email).get()
    .then(snapshot => {
        if(snapshot.empty){
            portfolios.add({
                email: req.user.email,
                portfolios: []
            })
            .then(() => {
                res.json({
                    status: config.statusCodes.failed,
                    errorType: config.errorCodes.api,
                    errors: [
                        {msg: `Portfolio ${portfolioName} doesn't exist`}
                    ]
                });
            });
        } else if(snapshot.size > 1){
            res.json({ // inconsistent database
                status: config.statusCodes.failed,
                errorType: config.errorCodes.db,
                errors: [
                    {msg: `Multiple users found! (Inconsistent database)`}
                ]
            });
        } else {
            snapshot.forEach(doc => {
                let allPortfolios = doc.data().portfolios;
                let wasRemoved = false;
                allPortfolios = allPortfolios.filter(portfolio => {
                    if(portfolio.name == portfolioName){
                        wasRemoved = true;
                        return false;
                    } else {
                        return true;
                    }
                });
                if(wasRemoved){
                    portfolios.doc(doc.id).update({
                        portfolios: allPortfolios
                    })
                    .then(() => {
                        res.json({
                            status: config.statusCodes.ok,
                            msg: `Portfolio ${portfolioName} removed!`
                        })
                    });
                } else {
                    res.json({
                        status: config.statusCodes.failed,
                        errorType: config.errorCodes.api,
                        errors: [
                            {msg: `Portfolio ${portfolioName} doesn't exist!`}
                        ]
                    });
                } 
            });
        }
    })
    .catch(err => {
        console.log('Portfolio remove failed:', err);
        res.json({
            status: config.statusCodes.failed,
            errorType: config.errorCodes.internal,
            errors: [
                {msg: 'Unexpected Error', error: err}
            ]
        });
    });

});


// modify a portfolio for the user
router.post('/edit', (req, res) => {
    if(!req.user){
        res.json({
            status: config.statusCodes.failed,
            errorType: config.errorCodes.auth,
            errors: [
                {msg: 'Authenticated but user not Found'}
            ]
        });
        return;
    }

    const data = req.body.portfolio;
    if(!data){
        res.json({
            status: config.statusCodes.failed,
            errorType: config.errorCodes.api,
            errors: [
                {msg: 'No portfolio found in request'}
            ]
        });
        return;
    }

    const errors = [];
    if(!data.name){
        errors.push({msg: 'Portfolio has no name!'});
    }
    if(!(data.items instanceof Array)){
        errors.push({msg: 'Portfolio has no items array!'});
    }
    if(errors.length > 0){
        res.json({
            status: config.statusCodes.failed,
            errorType: config.errorCodes.api,
            errors
        });
        return;
    }

    const portfolio = {
        name: data.name,
        items: []
    };
    const promises = [];
    for(let i=0; i<data.items.length; i++){
        let {symbol, price, quantity} = data.items[i];

        // item has no proper symbol
        if(!stocksdb.has(symbol)){
            res.json({
                status: config.statusCodes.failed,
                errorType: config.errorCodes.api,
                errors: [
                    {msg: `Item index ${i} has no valid symbol`}
                ]
            });
            return;
        }

        // item has no quantity present
        if(!quantity || isNaN(quantity) || quantity <= 0){
            res.json({
                status: config.statusCodes.failed,
                errorType: config.errorCodes.api,
                errors: [
                    {msg: `Item index ${i} has no valid quantity`}
                ]
            });
            return;
        }

        // price is present but not valid
        if(price && (isNaN(price) || price < 0) ){
            res.json({
                status: config.statusCodes.failed,
                errorType: config.errorCodes.api,
                errors: [
                    {msg: `Item index ${i} has no valid price`}
                ]
            });
            return;
        } else { // price is absent, bring from quote
            if(!price){
                portfolio.items.push({
                    symbol,
                    quantity
                });
                promises.push(quotes.where('symbol', '==', symbol).get()
                .then(snapshot => {
                    if(snapshot.size != 1){
                        res.json({ // inconsistent database
                            status: config.statusCodes.failed,
                            errorType: config.errorCodes.db,
                            errors: [
                                {msg: `Item index ${i} is valid but (none/multiple) quotes`}
                            ]
                        });
                    } else { // assign price
                        snapshot.forEach(doc => {
                            portfolio.items[i].price = doc.data().price;
                        });
                    }
                }));
            } else {
                portfolio.items.push({
                    symbol,
                    quantity,
                    price
                });
                promises.push('Price was present');
            }
        }
    }

    Promise.all(promises)
    .then(values => {
        portfolios.where('email', '==', req.user.email).get()
        .then(snapshot => {
            if(snapshot.empty){
                portfolios.add({
                    email: req.user.email,
                    portfolios: []
                })
                .then(() => {
                    res.json({
                        status: config.statusCodes.failed,
                        errorType: config.errorCodes.api,
                        msg: `Portfolio ${portfolio.name} doesn't exist!`
                    });
                });
            } else if(snapshot.size > 1){
                res.json({ // inconsistent database
                    status: config.statusCodes.failed,
                    errorType: config.errorCodes.db,
                    errors: [
                        {msg: `Multiple users found! (Inconsistent database)`}
                    ]
                });
            } else {
                snapshot.forEach(doc => {
                    const userData = doc.data();

                    let exists = false;

                    for(let i=0; i<userData.portfolios.length; i++){
                        // check for old copy
                        if(userData.portfolios[i].name == portfolio.name){
                            exists = true;
                            userData.portfolios[i] = portfolio;
                            break;
                        }
                    }

                    if(exists){
                        portfolios.doc(doc.id).set(userData)
                        .then(() => {
                            res.json({
                                status: config.statusCodes.ok,
                                msg: `Portfolio ${portfolio.name} modified!`
                            });
                        });
                    } else {
                        res.json({
                            status: config.statusCodes.failed,
                            errorType: config.errorCodes.api,
                            msg: `Portfolio ${portfolio.name} doesn't exist!`
                        });
                    }
                });
            }
        })
    })
    .catch(err => {
        console.log('Portfolio Modify failed:', err);
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



// query.forEach(doc=>{
//     console.log(doc.data().name);     
//     portfolios.where('email', '==', doc.data().owner).get()
//     .then(query2=>{
//         if(query2.empty){
//             console.log('4');
//             errors.push(`owner ${doc.data().owner} of portfolio ${doc.data().name} not found. Entry deleted from sharedList`);
//             sharedList.doc(doc.id).delete();
//         }
//         else if(query2.size>1){
//             console.log('5');
//             errors.push(`Database inconsistent for owner ${doc.data().owner} of portfolio ${doc.data().name} .Entry deleted from sharedList`);
//             sharedList.doc(doc.id).delete();
//         }
//         else{
//             console.log('6');
//             query2.forEach(user=>{
//                 console.log('7');
//                 let portfolio = user.data().portfolios.find(portfolio => portfolio.name == doc.data().name);
//                 if(portfolio){
//                     console.log('8');
//                     curPort.push(portfolio);
//                     console.log(curPort);
//                 }
//                 else{
//                     console.log('9');
//                     errors.push(`owner ${doc.data().owner} doesnt have a portfolio ${doc.data().name} not found. Entry deleted from sharedList`);
//                     sharedList.doc(doc.id).delete();
//                 }
//             });                    
//         }
//     });
// })