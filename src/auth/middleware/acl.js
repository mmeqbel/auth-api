'use strict';

module.exports = (capability) => {

  return (req, res, next) => {
      console.log(req.user.capabilities);
    try {
      if (req.user.capabilities.includes(capability)) {
        next();
      }
      else {
        next('Access Denied');
      }
    } catch (e) {
      next('Invalid Login');
    }

  }

}