/**
 * @file Index file that gathers all relevant routes in one spot for inclusion by app.
 * @author David J. Thomas
 */

module.exports = app => {
  require('./user.routes')(app);
  require('./profile.routes')(app);
  require('./model.routes')(app);
};
