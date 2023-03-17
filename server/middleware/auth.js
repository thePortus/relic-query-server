/**
 * @file provides middleware (implemented in routes) that ensures
 * that users accessing routes are either logged in, or, are editors/owners.
 * @author David J. Thomas
 */


const jwt = require('jsonwebtoken');

const config = require('../config/db.config');

/**
 * Ensures that request was sent by an authorized user.
 * 
 * @param {*} req Request object
 * @param {*} res Response data from database
 * @param {*} next Next function to execute, upon completion
 */
module.exports.verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    res.status(401).send({ message: 'Unauthorized' });
  }
  else {
    jwt.verify(req.headers.authorization, config.JWT_SECRET, function (err, decoded) {
      if(decoded) {
        req.user = decoded.data;
        next();
      }
      else {
        res.status(401).send({ message: 'Unauthorized' });
      }
    });
  }
};

/**
 * Ensures that request was sent by an authorized editor or owner.
 * 
 * @param {*} req Request object
 * @param {*} res Response data from database
 * @param {*} next Next function to execute, upon completion
 */
module.exports.verifyAdminToken = (req, res, next) => {
  const adminRoles = ['Owner', 'Editor'];
  if (!req.headers.authorization) {
    res.status(401).send({ message: 'Unauthorized' });
  }
  else {
    jwt.verify(req.headers.authorization, config.JWT_SECRET, function (err, decoded) {
      if(decoded) {
        req.user = decoded.data;
        if(!adminRoles.includes(req.user.role)) {
          res.status(401).send({ message: 'User is not an approved administrator'});
        }
        else {
          next();
        }
      }
      else {
        res.status(401).send({ message: 'Unauthorized' });
      }
    });
  }
};
