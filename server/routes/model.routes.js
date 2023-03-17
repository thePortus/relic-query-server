/**
 * @file Routes for modifying models
 * @author David J. Thomas
 */

const auth = require('../middleware/auth');
const limitRate = require('../middleware/limit-rate');

module.exports = app => {
  const controller = require('../controllers/model.controller.js');
  var router = require('express').Router();
  // Post item
  router.post('/', limitRate, auth.verifyAdminToken, controller.create);
  // Retrieve all
  router.get('/', controller.findAll);
  // Retrieve a single item
  router.get('/:id', limitRate, controller.findOne);
  // Update item
  router.put('/:id', limitRate, auth.verifyAdminToken, controller.update);
  // Delete an item
  router.delete('/:id', limitRate, auth.verifyAdminToken, controller.delete);
  // Delete all items
  router.delete('/', limitRate, auth.verifyAdminToken, controller.deleteAll);
  app.use('/api/models', router);
};
