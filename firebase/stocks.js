const firestore = require('./firebase').firestore();

const collection = firestore.collection('stocks');

const stocks = new Set();

collection.get()
.then(snapshot => {
    snapshot.forEach(doc => {
        stocks.add(doc.data().symbol);
    })
});

module.exports = stocks;