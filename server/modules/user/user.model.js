const mongoose = require('mongoose');
const crypto = require('crypto');
const config = require('../../config/config');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    unique: 'Email already exists',
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    required: 'Email is required'
  },

  hashed_password: {
    type: String,
    required: 'Password is required!'
  },

  salt: String,

  name: {
    type: String,
    trim: true,
    match: [/a-zA-Z /, 'Please fill a valid email address'],
  },

  role: {
    type: String,
    enum: [
      '',
      'super',
      'moderator',
    ],
    default: ''
  },

  country: {
    type: String,
    enum: [
      '',
      'US',
      'IL',
    ],
    default: 'IL'
  },

  communities: {
    type: [String]
  },

  image: {
    type: String,
    trim: true,
    maxlength: 255,
    default: 'www.example.com',
  },

}, { timestamps: true })

UserSchema
  .virtual('password')
  .set(function (password) {
    this._password = password
    this.salt = this.makeSalt()
    this.hashed_password = this.encryptPassword(password)
  })
  .get(function () {
    return this._password
  })


UserSchema.path('hashed_password').validate(function (v) {
  if (this._password && this._password.length < 6) {
    this.invalidate('password', 'Password must be at least 6 characters.')
  }
  if (this.isNew && !this._password) {
    this.invalidate('password', 'Password is required')
  }
}, null)

UserSchema.methods = {
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password
  },
  encryptPassword: function (password) {
    if (!password) return ''
    try {
      return crypto
        .createHmac('sha1', this.salt)
        .update(password)
        .digest('hex')
    } catch (err) {
      return ''
    }
  },
  makeSalt: function () {
    return Math.round((new Date().valueOf() * Math.random())) + ''
  },

}

module.exports = {
  User: mongoose.model('User', UserSchema)
}