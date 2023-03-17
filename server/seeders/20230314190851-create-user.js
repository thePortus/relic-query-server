/**
 * @file Seeds the database with starting site owner data.
 * @author David J. Thomas
 */

const md5 = require('md5');

const config = require('../config/db.config.js');

module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.bulkInsert('Users', [
        {
          username: config.OWNER_USERNAME,
          password: md5(config.OWNER_PASSWORD),
          email: config.OWNER_EMAIL,
          role: 'Owner',
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ],
    {});

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users');
  }
};
