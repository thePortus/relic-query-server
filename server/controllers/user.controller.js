/**
 * @file Controller for registering, updating, and logging users in.
 * @author David J. Thomas
 */

const md5 = require('md5');
const jwt = require('jsonwebtoken');
const db = require('../models');

const config = require('../config/db.config');

const Op = db.Sequelize.Op;

const User = db.users;

// Retrieve all Users from the database.
exports.findAll = (req, res) => {

  // calculate limit and offset values from page and size values
  const getPagination = (page, size) => {
    const limit = size ? +size : 3;
    const offset = page ? page * limit : 0;
  
    return { limit, offset };
  };

  let { username, page, size } = req.query;
  var condition = username ? { username: { [Op.like]: `%${username}%` } } : null;
  let { limit, offset } = getPagination(page, size);
  // if no page or size values provided, return ever item, with no includes (for quick reference lists)
  if (page === undefined || size === undefined) {
    User.findAll({
      where: condition
    })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.send({
          message:
            err.message || 'Some error occurred while retrieving conferences.'
        });
      });
  }
  // otherwise return full data for specified items
  else {
    User.findAndCountAll({
      where: condition,
      limit,
      offset,
      distinct: true,
    })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.send({
          message:
            err.message || 'Some error occurred while retrieving users.'
        });
      });
  }
};

// Log a user in
exports.login = (req, res) => {
  // Validate request
  if (!req.body.username) {
    res.send({
      message: 'Must contain an \'username\'!'
    });
    return;
  }
  if (!req.body.password) {
    res.send({
      message: 'Must contain an \'password\' number!'
    });
    return;
  }
  const requestObj = {
    username: req.body.username,
    // hash the password
    password: md5(req.body.password.toString()),
  };
  User.findOne({
    where: {
      username: requestObj.username,
      password: requestObj.password
    }
  })
    .then(data => {
      if (!data || data.length == 0) {
        res.send({
          status: 0,
          message:'User not found or password incorrect'
        });
      }
      else {
        let token = jwt.sign({ data: data },  config.JWT_SECRET ? config.JWT_SECRET : 'secret');
        res.send({ status: 1, data: data, token: token });
      }
    })
    .catch(err => {
      res.send({
        status: 0,
        message:
          err.message || 'Some error occurred while logging in.'
      });
    });
};

// Register a user
exports.register = (req, res) => {
  // Validate request
  if (!req.body.username) {
    res.send({
      message: 'Must contain an \'username\'!'
    });
    return;
  }
  if (!req.body.email) {
    res.send({
      message: 'Must contain an \'email\' number!'
    });
    return;
  }
  if (!req.body.password) {
    res.send({
      message: 'Must contain an \'password\' number!'
    });
    return;
  }

  // check for existing users, if none, make first user owner
  User.findAll()
    .then(allUsers => {
      // default to making new user normal user
      var userRole = 'User';
      if (allUsers.length == 0) {
        userRole = 'Owner';
      }
      const requestObj = {
        username: req.body.username,
        email: req.body.email,
        role: userRole,
        // hash the password
        password: md5(req.body.password.toString()),
      };
      User.create(requestObj)
        .then(data => {
          if (!data) {
            res.send({
              status: 0,
              message:
                'Some error occurred while registering.'
            });
          }
          else {
            let token = jwt.sign({ data: data }, 'secret');
            res.send({ status: 1, data: data, token: token });
          }
        })
        .catch(err => {
          res.send({
            status: 0,
            message:
             err.msg || 'An error occured, username or email may already be taken.'
          });
        });
    });
};

// Update a user by the username in the request
exports.update = (req, res) => {
  if (!req.body.username) {
    res.send({
      message: 'Must contain an \'username\'!'
    });
    return;
  }
  var requestObj = {};
  requestObj.username = req.params.username;
  if (req.body.email) {
    requestObj.email = req.body.email;
  }
  if (req.body.role) {
    requestObj.role = req.body.role;
  }
  User.update(requestObj, {where: { username: requestObj.username }})
    .then(num => {
      if (num == 1) {
        res.send({
          message: 'User was updated successfully.'
        });
      } else {
        res.send({
          message: `Cannot update User with username=${requestObj.username}. Maybe User was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.send({
        message: err.msg || 'Error updating User with id=' + requestObj.username
      });
    });

};
