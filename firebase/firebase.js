const admin = require("firebase-admin");
const config = require('../config');

const serviceAccount = require('./admin-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.firestoreURL
});

module.exports = admin;