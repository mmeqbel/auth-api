'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//build the user collection schema
const usersSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    default: 'user',
    enum: ['user','editor', 'admin']
  },
});
// }, { toObject: { getters: true } }); // What would this do if we use this instead of just });

// Adds a virtual field to the schema. We can see it, but it never persists
// So, on every user object ... this.token is now readable!

usersSchema.virtual('token').get(function () {
  let tokenObject = {
    username: this.username,
  }
  return jwt.sign(tokenObject, process.env.SECRET)
});

usersSchema.virtual('capabilities').get(function () {
  let acl = {
    user: ['read'],
    editor: ['read', 'create', 'update'],
    admin: ['read', 'create', 'update', 'delete']
  };
  return acl[this.role];
});
//this function should not be arrow function
usersSchema.pre('save', async function(){
  //We use is Modified  to run the pre save only when the password is modified
  //and not when other update functions happen
  if (this.isModified('password')) {
    console.log("modified");
    //hash the password before saving it to the db
    this.password = await bcrypt.hash(this.password, 10);
    console.log({password:this.password});
  }
});

// BASIC AUTH
usersSchema.statics.authenticateBasic = async function (username, password) {
  const user = await this.findOne({ username });
  console.log("username : ",username);
  console.log("pass : ",password);
  //compare hashed password in database : user.password with password came from req
  const valid = await bcrypt.compare(password, user.password);
  if (valid) { return user; }
  throw new Error('Invalid User');
}

// BEARER AUTH
usersSchema.statics.authenticateWithToken = async function (token) {
  try {
    const parsedToken = jwt.verify(token, process.env.SECRET);
    const user = this.findOne({ username: parsedToken.username })
    if (user) { return user; }
    throw new Error("User Not Found");
  } catch (e) {
    throw new Error(e.message)
  }
}
module.exports=mongoose.model('users',usersSchema);