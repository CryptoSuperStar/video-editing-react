const passport = require('passport')
const TwitterTokenStrategy = require('passport-twitter-token')
const {User} = require('./models/user.model.js');

module.exports = function () {
  passport.use(new TwitterTokenStrategy({
      consumerKey: process.env.TWITTER_API,
      consumerSecret: process.env.TWITTER_SECRET,
      includeEmail: true
    },
    function (token, tokenSecret, profile, done) {
      User.upsertTwitterUser(token, tokenSecret, profile, function(err, user) {
        return done(err, user);
      });
    }));
};