/**
 * @file Controller for getting user profile data
 * @author David J. Thomas
 */

const jwt = require('jsonwebtoken');

const config = require('../config/db.config');

const db = require('../models');
const Op = db.Sequelize.Op;

const User = db.users;

// View user profile
exports.findOne = (req, res) => {
  // Validate request
  if (!req.params.username) {
    res.send({
      message: 'Must contain an \'username\'!'
    });
    return;
  }
  const requestObj = {
    username: req.params.username
  };
  User.findOne({where: {username: requestObj.username}})
    .then(data => {
      if (!data || data.length == 0) {
        res.send({
          status: 0,
          message:'User not found incorrect'
        });
      }
      else {
        let token = jwt.sign({ data: data }, config.JWT_SECRET ? config.JWT_SECRET : 'secret');
        res.send({ status: 1, data: data, token: token });
      }
    })
    .catch(err => {
      res.send({
        status: 0,
        message:
          err.message || 'Some error occurred while viewing profile.'
      });
    });
};
