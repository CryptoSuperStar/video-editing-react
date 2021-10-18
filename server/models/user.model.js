const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
    unique: true
  },
  userName: {
    type: String,
    trim: true
  },
  registeredWith: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    trim: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    minlength: 8
  },
  twitterId: {
    type: String,
    trim: true
  },
  facebookId: {
    type: String,
    trim: true
  },
  appleId: {
    type: String,
    trim: true
  },
  twitterProvider: {
    type: {
      id: String,
      token: String
    },
    select: false
  },
  paymentId: {
    type: String
  },
  trial: {
    active: {
      type: Boolean,
      default: false
    },
    activated: {
      type: Date
    },
    activatedExpires: {
      type: Date
    }
  },
  socialLinks: {
    type: {
      instagramLink: String,
      youTubeLink: String
    }
  },
  plan: {
    type: {
      title: String,
      price: String,
      totalCost: String,
      paidWith: String,
      paidDate: Date,
      paidExpiresDate: Date
    }
  }
}, {timestamps: true})

userSchema.set('toJSON', {getters: true, virtuals: true});

userSchema.statics.upsertTwitterUser = async function(token, tokenSecret, profile, cb) {
  console.log(profile);
  let that = this;
  return await this.findOne({
    'twitterProvider.id': profile.id
  }, async function(err, user) {
    // no user was found, lets create a new one
    if (!user) {
      let newUser = new that({
        email: profile.emails[0].value,
        registeredWith: 'twitter',
        twitterId: profile.id,
        twitterProvider: {
          id: profile.id,
          token: token,
          tokenSecret: tokenSecret
        }
      });
      await newUser.save(function(error, savedUser) {
        if (error) {
          console.log(error);
        }
        return cb(error, savedUser);
      });
    } else {
      return cb(err, user);
    }
  });
};

const User = mongoose.model('User', userSchema);
module.exports = { User };