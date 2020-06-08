const LocalStrategy = require('passport-local').Strategy;
const firestore = require('../firebase/firebase').firestore();

const collection = firestore.collection('users');

module.exports = passport => {
    passport.use(
        new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
            let matches = [];
            collection.where('email', '==', email).get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    matches.push(doc.data());
                });
            })
            .then(() => {
                if(matches.length == 0){
                    return done(null, false, [{msg: 'Unregistered Email'}]);
                } else if(matches.length === 1){
                    let userData = matches[0];
                    if(password === userData.password){
                        return done(null, userData);
                    }else{
                        return done(null, false, [{msg: 'Wrong Password'}]);
                    }
                }else{
                    throw 'multiple duplicates';
                }
            })
            .catch(err => {
                console.log('Passport Error:', err);
            });
        }));

    passport.serializeUser((user, done) => {
        done(null, user.email);
    });

    passport.deserializeUser((email, done) => {
        let err = null;
        let matches = [];
        collection.where('email', '==', email).get()
        .then(snapshot => {
            if(snapshot.empty){
                err = 'User not found..!';
                return null;
            } else {
                snapshot.forEach(doc => matches.push(doc.data()));
                return matches[0];
            }
        })
        .then(user => {
            done(err, user);
        });
    });
};