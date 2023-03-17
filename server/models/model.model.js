'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ModelFile extends Model {
    static associate(models) {
      // location
      ModelFile.belongsTo(models.users, {
        foreignKey: { name: 'uploadedBy' },
        as: 'uploader'
      });
    }
  }
  ModelFile.init({
    title: DataTypes.STRING,
    // id of location
    uploadedBy: {
      type: DataTypes.STRING,
      references: {
        model: 'User',
        key: 'username',
      },
    },
    description: DataTypes.TEXT,
    credits: DataTypes.TEXT,
    file: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Model',
  });
  return ModelFile;
};