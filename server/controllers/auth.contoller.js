const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const passport = require('passport');
const request = require('request');
const { OAuth2Client } = require('google-auth-library');
const fetch = require('node-fetch');
const appleSignin = require("apple-signin-auth");
const generateUniqueId = require('generate-unique-id');

const { User } = require('../models/user.model.js');
const { use } = require("express/lib/router");

const nodemailer = require('nodemailer');
const crypto = require('crypto');

const sendPasswordResetEmail = async (email, token) => {

  let transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD
    }
  });

  let info = await transporter.sendMail({
    from: process.env.MAIL_SENDER,
    to: email,
    subject: "Reset your password",
    text: `Hello, \n\nPlease click here to reset your password:\n\n https://myvideospro.com/password_reset?token=${token}`,
    html: `Hello, <br /><br />Please click here to reset your password:<br /><br /><a href="https://myvideospro.com/password_reset?token=${token}">https://myvideospro.com/password_reset?token=${token}</a>`,
  });

  return info.messageId
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT);
const generatePromoCode = async () => {
  const promo = generateUniqueId({
    length: 3,
    useNumbers: false
  }) + generateUniqueId({
    length: 3,
    useLetters: false
  });;
  let editor = await User.findOne({ promocode: promo, userRole: "editor" });
  return editor ? generatePromoCode() : promo;
}
let createToken = function (auth) {
  return jwt.sign({ id: auth.id }, process.env.JWT_SECRET,
    {
      expiresIn: 60 * 120
    });
};

let generateToken = function (req, res, next) {
  req.token = createToken(req.auth);
  return next();
};

let sendToken = function (req, res) {
  return res.status(200).json({ token: req.token });
};

exports.registerController = (async (req, res) => {

  const { firstName, lastName, userName, organization, userRole, email, password } = req.body;

  try {
    // See if userName exists
    let existUserName = await User.findOne({ userName });
    if (existUserName) return res.status(400).send({ msg: 'Username already exists. Please provide a different one' });
    // See if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).send({ msg: 'User already exists' });


    const avatar = gravatar.url(email, {
      s: '200',
      r: 'pg',
      d: 'mm'
    });

    user = new User({
      email,
      password,
      firstName,
      lastName,
      userName,
      organization,
      userRole,
      avatar,
      registeredWith: "SSO"
    });
    // generate promo code
    if (userRole === "editor") {
      const promo = await generatePromoCode();
      user.promocode = promo;
    }
    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    // Return jsonwebtoken
    jwt.sign(user.id, process.env.JWT_SECRET, (err, token) => {
      if (err) throw err;
      res.json({ token })
    })
  } catch (e) {
    console.error(e.message);
    res.status(500).send({ msg: 'Server Error' })
  }
})

exports.loginController = async (req, res) => {

  const { email, password } = req.body;
  try {
    // See if user does not exists
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });


    jwt.sign(user.id, process.env.JWT_SECRET, (err, token) => {
      if (err) throw err;
      res.json({ token })
    })

  } catch (e) {
    console.error(e.message);
    res.status(500).send({ msg: 'Server Error' })
  }
}

exports.passwordResetSSOController = async (req, res) => {

  const email = req.body.email

  try {
    let user = await User.findOne({ email });
    if (!user) return res.json({ success: false });

    const token = crypto.randomBytes(50).toString('hex');
    if (token.length < 50) { throw Error('token cannot be created')}

    const duration = 60 * 60 * 1000; // 1 hour

    User.findOneAndUpdate({ email }, { 
      $addToSet: { 
        passwordResetTokens: { token: token, expiresOn: Date.now() + duration}  
      }
    }, { new: true }, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ success: false });
      }
    })

    const mailMessageId = await sendPasswordResetEmail(email, token).catch(console.error);
    if(!mailMessageId) {
      throw Error('Error: Email could not sent.')
    } else {
      res.json({ success: true })
    }

  } catch (e) {
    console.error(e.message);
    res.status(500).send({ msg: 'Server Error' })
  }
}

exports.passwordResetUpdateSSOController = async (req, res) => {

  const passwordResetToken = req.body.token
  const password = req.body.password

  try {
    let user = await User.findOne({ 
      'passwordResetTokens.token': passwordResetToken,
      'passwordResetTokens.expiresOn': {
        $gt: Date.now()
      } 
    });
    if (!user) return res.json({ success: false });

    if (user.registeredWith === 'SSO') {
      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      user.passwordResetTokens = [];
      
      user = await user.save();
      if (!user) return res.json({ success: false });
      
      res.json({ success: true })
    }

  } catch (e) {
    console.error(e.message);
    res.status(500).send({ msg: 'Server Error' })
  }
}

exports.resetPassword = async (req, res) => {
  const id = req.userId;
  const { oldPass, newPass } = req.body;
  try {
    let user = await User.findById(id);
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials1' });
    console.log('user1', user);
    if (user.registeredWith === 'SSO') {
      const isMatch = await bcrypt.compare(oldPass, user.password);
      if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials2' });
      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPass, salt);
      User.findByIdAndUpdate(id, { $set: user }, { new: true }, (err, data) => {
        console.log('user2', data);
        if (err) {
          console.log(err);
          return res.status(400).send({ msg: err });
        }
        jwt.sign(data.id, process.env.JWT_SECRET, (err, token) => {
          if (err) throw err;
          console.log(token);
          res.json(token)
        })
      })
    }
  } catch (e) {
    console.log(e);
    return res.status(400);
  }
}

exports.authController = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(['-password', '-twitterProvider', '-__v']);
    if (!user) res.status(400).send({ msg: 'Token is invalid or expired' });
    res.json({ user });
  } catch (e) {
    console.error(e.message);
    res.status(500).send({ msg: 'Server Error' });
  }
}

exports.oAuthTwitter = ((req, res, next) => {
  request.post({
    url: `https://api.twitter.com/oauth/access_token?oauth_verifier`,
    oauth: {
      consumer_key: process.env.TWITTER_API,
      consumer_secret: process.env.TWITTER_SECRET,
      token: req.query.oauth_token
    },
    form: { oauth_verifier: req.query.oauth_verifier }
  }, function (err, r, body) {
    if (err) {
      return res.status(500).send({ msg: err.message });
    }

    const bodyString = '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
    const parsedBody = JSON.parse(bodyString);

    req.body['oauth_token'] = parsedBody.oauth_token;
    req.body['oauth_token_secret'] = parsedBody.oauth_token_secret;
    req.body['user_id'] = parsedBody.auth;
    next();
  });
}, passport.authenticate('twitter-token', { session: false }), function (req, res, next) {
  if (!req.user) {
    return res.status(401).send({ msg: 'User Not Authenticated' });
  }
  // prepare token for API
  req.auth = {
    id: req.user.id
  };

  return next();
}, generateToken, sendToken)

exports.tokenTwitter = async (req, res) => {
  request.post({
    url: 'https://api.twitter.com/oauth/request_token',
    oauth: {
      oauth_callback: "http%3A%2F%2Flocalhost%3A3000%2Ftwitter-callback",
      consumer_key: process.env.TWITTER_API,
      consumer_secret: process.env.TWITTER_SECRET
    }
  }, function (err, r, body) {
    if (err) {
      return res.status(500).send({ msg: err.message });
    }
    let jsonStr = '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
    res.send(JSON.parse(jsonStr));
  });
}

exports.googleController = async (req, res) => {
  const { idToken } = req.body;
  //Verify token
  client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT })
    .then(response => {
      const { email_verified, name, email, picture } = response.payload;
      //Check if email verified
      if (email_verified) {
        User.findOne({ email }).exec((error, user) => {
          //Find if this email already exists
          if (user) {
            jwt.sign({ _id: user._id }, process.env.JWT_SECRET, (error, token) => {
              if (error) return res.status(400).json({ msg: error });
              return res.json({ token });
            });
          } else {
            //If user not exists we will save in DB
            user = new User({ userName: name, email, registeredWith: 'google', avatar: picture });
            user.save((error, data) => {
              if (error) {
                console.log('ERROR GOOGLE LOGIN ON USER SAVE', error);
                return res.status(400).json({ msg: 'User signup failed with google' })
              }
              //If no error generate token
              jwt.sign({ _id: data._id }, process.env.JWT_SECRET, { expiresIn: '7d' }, (error, token) => {
                if (error) throw error;
                return res.json({ token, registering: true })
              });
            })
          }
        })
      } else {
        //If Error
        return res.status(400).json({ msg: "Google login failed. Try again." })
      }
    })
}

exports.facebookController = async (req, res) => {
  const { userId, accessToken } = req.body;


  const url = `https://graph.facebook.com/${userId}?fields=id,name,email&access_token=${accessToken}`;
  // get from facebook
  await fetch(url, { method: 'GET' }).then(response => response.json()).then(response => {
    const { email, name, id } = response;

    console.log('response 1', response);

    User.findOne({ email }).exec((error, user) => {
      if (error) {
        console.log('user findOne error', error);
        return res.status(400).json({ msg: 'Something went wrong...' })
      } else {
        if (user) {
          jwt.sign({ _id: user._id }, process.env.JWT_SECRET, (error, token) => {
            if (error) {
              console.log('get token error')
              return res.status(400).json({ msg: error.message })
            }
            return res.status(200).json({ token });
          })
        } else {
          const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
          });
          user = new User({ userName: name, email, registeredWith: 'facebook', facebookId: id, avatar });
          user.save((error, data) => {
            if (error) {
              console.log('ERROR FACEBOOK LOGIN ON USER SAVE', error);
              return res.status(400).json({ msg: error.message })
            }
            //If no error generate token
            jwt.sign({ _id: data._id }, process.env.JWT_SECRET, (error, token) => {
              if (error) return res.status(400).json({ msg: error.message });
              return res.status(200).json({ token, registering: true })
            });
          })
        }
      }
    })
  }).catch(error => { return res.status(400).json({ msg: 'Facebook login failed. Try later' }) })
}

exports.appleController = async (req, res) => {
  const { user: { name, email }, authorization: id_token } = req.body;
  try {
    const { sub: userAppleId } = await appleSignin.verifyIdToken(
      id_token, // We need to pass the token that we wish to decode.
      {
        audience: "com.example.web", // client id - The same one we used on the frontend, this is the secret key used for encoding and decoding the token.
        nonce: 'nonce', // nonce - The same one we used on the frontend - OPTIONAL
        ignoreExpiration: true
      }
    );
    if (userAppleId) {
      User.findOne({ email }).exec((error, user) => {
        //Find if this email already exists
        if (user) {
          jwt.sign({ _id: user._id }, process.env.JWT_SECRET, (error, token) => {
            if (error) return res.status(400).json({ msg: error.message });
            return res.json({ token });
          });
        } else {
          const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
          });
          //If user not exists we will save in DB
          user = new User({ userName: name, email, registeredWith: 'apple', appleId: userAppleId, avatar });
          user.save((error, data) => {
            if (error) {
              console.log('ERROR APPLE LOGIN ON USER SAVE', error.message);
              return res.status(400).json({ msg: 'User signup failed with apple' })
            }
            //If no error generate token
            jwt.sign({ _id: data._id }, process.env.JWT_SECRET, { expiresIn: '7d' }, (error, token) => {
              if (error) throw error;
              return res.json({ token, registering: true })
            });
          })
        }
      })
    } else {
      //If Error
      return res.status(400).json({ msg: "Apple login failed. Try again." })
    }
  } catch (e) {
    console.error(e)
  }
}

exports.updateUserController = async (req, res) => {
  const { id, data, action } = req.body;
  if (action === "Sign Up") {
    if (data.userRole === "editor") {
      const promo = await generatePromoCode();
      data.promocode = promo;
    }
  }
  try {
    // See if userName exists
    const oldUser = await User.findById(id);
    if (oldUser?.userName !== data?.userName) {
      let existUserName = await User.findOne({ userName: data.userName });
      if (existUserName) return res.status(400).send({ msg: 'Username already exists. Please provide a different one' });
    }
    User.findByIdAndUpdate(id, { $set: data }, { new: true })
      .select(['-password', '-twitterProvider', '-__v'])
      .exec((err, user) => {
        if (!user) return res.status(400).json({ msg: 'User not found' });
        if (err) return res.status(400).json({ msg: err.message });
        return res.status(200).json({ user })
      })
  } catch (e) {
    return res.status(400).json({ msg: e.message });
  }
}

exports.connectSocial = async (req, res) => {
  const { social, link } = req.body;
  try {
    User.findByIdAndUpdate(req.userId, { $set: { socialLinks: { [social]: link } } }, { new: true })
      .select(['-password', '-twitterProvider', '-__v'])
      .exec((err, user) => {
        if (!user) return res.status(400).json({ msg: 'User not found' });
        if (err) return res.status(400).json({ msg: err.message });
        return res.status(200).json({ user })
      })
  } catch (e) {
    return res.status(400).json({ msg: e.message });
  }
}
