/**
 * @file Controller for modifying models
 * @author David J. Thomas
 */

const db = require('../models');
const Op = db.Sequelize.Op;

const path = require('path');
const process = require('process');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const aws = require('aws-sdk');

const config = require('../config/db.config');

const Model = db.models;
const User = db.users;

const spacesEndpoint = new aws.Endpoint(process.env.BUCKET_ENDPOINT);
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.BUCKET_KEY,
  secretAccessKey: process.env.BUCKET_SECRET
});

// create and save a new item
exports.create = (req, res) => {
  let user = {};
  var errorMsgs = [];
  // validate request
  if (!req.body.title) {
    errorMsgs.push('Must contain a \'title\' field!');
  }
  if (!req.body.model) {
    errorMsgs.push('Must contain a \'model\' field!');
  }
  if (errorMsgs.length > 0) {
    res.send({
      status: 0,
      messages: errorMsgs
    });
    return;
  }
  jwt.verify(req.headers.authorization, config.JWT_SECRET, function (err, decoded) {
    if(decoded) {
      user = decoded.data;
    }
    else {
      res.status(401).send({ message: 'Unauthorized' });
    }
  });
  let filepath = uuidv4();
  const requestObj = {
    id: req.body.id || null,
    title: req.body.title,
    uploadedBy: user.username,
    description: req.body.description,
    credits: req.body.credits,
    model: filepath + '.gltf'
  };
  // put model mesh in storage
  s3.putObject({
    Bucket: process.env.BUCKET_NAME,
    Key: user.username + '/' + filepath + '.gltf',
    Body: req.body.model,
    ACL: 'public-read'
  }, (err, data) => {
    if (err) {
      console.log('ERROR UPLOADING MODEL: ');
      console.log(err);
    }
    console.log('FILES UPLOADED SUCCESSFULLY');
    // save item in the database
    Model.create(requestObj)
      .then(data => {
        
        res.send(data);
      })
      .catch(err => {
        res.send({
          message:
            err.message || 'Some error occurred while creating the model.'
        });
      });
  });
  
};

// retrieve all items from the database.
exports.findAll = (req, res) => {

  // calculate limit and offset values from page and size values
  const getPagination = (page, size) => {
    const limit = size ? +size : 3;
    const offset = page ? page * limit : 0;
    return { limit, offset };
  };

  let { title, user, page, size } = req.query;
  let where = {};
  let userWhere = {};
  let { limit, offset } = getPagination(page, size);

  if (title) {
    where.title = { [Op.like]: `%${title}%` };
  }
  if (user) {
    userWhere.title = {
      [Op.like]: `%${user}%`
    };
  }

  // if no page or size values provided, return ever item, with no includes (for quick reference lists)
  if (page === undefined || size === undefined) {
    Model.findAll({
      where,
      order: [
        ['title', 'ASC']
      ]
    })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.send({
          message:
            err.message || 'Some error occurred while retrieving models.'
        });
      });
  }
  // otherwise return full data for specified items
  else {
    // build SQL for custom filtering
    Model.findAndCountAll({
      where,
      limit,
      offset,
      distinct: true,
      order: [
        ['title', 'ASC']
      ],
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['username'],
          where: userWhere,
          required: userWhere.title !== undefined
        }
      ]
    })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.send({
          message:
            err.message || 'Some error occurred while retrieving models.'
        });
      });
  }
};

// Find a single item with an id
exports.findOne = (req, res) => {
  const id = req.params.id;
  Model.findByPk(id, {
    include: [
      {
        model: User,
        as: 'uploader',
        attributes: ['username'],
      }
    ]
  })
    .then(data => {
      if (data) {
        // fetch model data from storage
        s3.getObject({
          Bucket: process.env.BUCKET_NAME,
          Key: data.uploadedBy + '/' + data.model,
        }, (err, modelData) => {
          if (err) {
            console.log('Error fetching model.');
          }
          // send res with file data attached
          res.send({
            id: data.id,
            title: data.title,
            uploadedBy: data.uploadedBy,
            description: data.description,
            credits: data.credits,
            model: data.model,
            modelData: modelData.Body.toString('utf-8')
          });
        });
      } else {
        res.send({
          message: `Cannot find model with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.send({
        message: 'Error retrieving model with id=' + id
      });
    });
};

// Update an item by the id in the request
exports.update = (req, res) => {
  var errorMsgs = [];
  // validate request
  if (!req.body.id) {
    errorMsgs.push('Must contain an \'id\' field!');
  }
  if (errorMsgs.length > 0) {
    res.send({
      status: 0,
      messages: errorMsgs
    });
    return;
  }
  const id = req.params.id;
  // update updatedAt to current time
  req.body.updatedAt = new Date();
  Model.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: 'Model was updated successfully.'
        });
      } else {
        res.send({
          message: `Cannot update model with id=${id}. Maybe model was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.send({
        message: 'Error updating model with id=' + id
      });
    });
};

// delete an item with the specified id in the request
exports.delete = (req, res) => {
  let user = {};
  jwt.verify(req.headers.authorization, config.JWT_SECRET, function (err, decoded) {
    if(decoded) {
      user = decoded.data;
    }
    else {
      res.status(401).send({ message: 'Unauthorized' });
    }
  });
  const id = req.params.id;
  Model.findByPk(id, {
    include: [
      {
        model: User,
        as: 'uploader',
        attributes: ['username'],
      }
    ]
  })
    .then(modelData => {
      if (modelData) {
        if (modelData.uploadedBy !== user.username && user.role !== 'Owner') {
          res.status(401).send({ message: 'Unauthorized to delete this model' });
          return;
        }
        s3.deleteObject({
          Bucket: process.env.BUCKET_NAME,
          Key: modelData.uploadedBy + '/' + modelData.model,
        }, (err, data) => {
          if (err) {
            console.log('ERROR DELETING MODEL: ');
            console.log(err);
          }
          console.log('FILE DELETED SUCCESSFULLY');
          Model.destroy({
            where: { id: id }
          })
            .then(num => {
              if (num == 1) {
                res.send({
                  message: 'Model was updated successfully!'
                });
              } else {
                res.send({
                  message: `Cannot delete model with id=${id}. Maybe model was not found!`
                });
              }
            })
            .catch(err => {
              res.send({
                message: err.message || 'Could not delete model with id=' + id
              });
            });
        });
      } else {
        res.send({
          message: `Cannot find model with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.send({
        message: 'Error retrieving model with id=' + id
      });
    });
};

// Delete all items from the database.
exports.deleteAll = (req, res) => {
  Model.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} models were deleted successfully!` });
    })
    .catch(err => {
      res.send({
        message:
          err.message || 'Some error occurred while removing all models.'
      });
    });
};
