#!/bin/sh

# migrate models to the database
node_modules/.bin/sequelize db:migrate
# upload seeder data
node_modules/.bin/sequelize db:seed:all