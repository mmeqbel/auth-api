  
'use strict';
//mongoose for connect to mongodb
const mongoose = require('mongoose');
const server = require('./src/server.js');
//configure envirement variables
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI,{
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
}).then(()=>{
    server.start(process.env.PORT);
}).catch(error=>{
    console.log("an error accoured whle starting the server "+error.message);
});


