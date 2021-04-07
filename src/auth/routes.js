'use strict';

const express = require('express');
const authRouter = express.Router();

const User = require('./models/users.js');
const basicAuth = require('./middleware/basic.js')
const bearerAuth = require('./middleware/bearer.js')
const permissions = require('./middleware/acl.js')


authRouter.post('/signup', async (req, res, next) => {
  try {
    //req.body {username:username,password:password}
    //produce token 
    //save the user to the database
    let user = new User(req.body);
    const userRecord = await user.save();//return the user record
    const output = {
      user: userRecord,
      token: userRecord.token  
    };
   res.status(201).json(output);
  } catch (e) {
    next(e.message)
  }
});
authRouter.post('/signin', basicAuth, (req, res, next) => {
  //basic auth middleware will validate the user 
  //if his/her was invalid user this route will not executed
  const user = {
    user: req.user,
    token: req.user.token//because the token is virtual
  };
  res.status(200).json(user);
});

authRouter.get('/users', bearerAuth, permissions('delete'), async (req, res, next) => {
  const users = await User.find({});
  const list = users.map(user => user.username);
  res.status(200).json(list);
});

authRouter.get('/secret', bearerAuth, async (req, res, next) => {
  res.status(200).send('Welcome to the secret area')
});

module.exports = authRouter;