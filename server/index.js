/*jshint node:true*/
module.exports = function(app) {
  const postsRoute = require('./mocks/posts.js');

  // Log proxy requests
  var morgan = require('morgan');
  app.use(morgan('dev'));
  postsRoute(app);
};
