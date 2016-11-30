/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-simple-auth-auth0',
  included: function(app) {
    app.import(`${app.bowerDirectory}/auth0-lock/build/lock.js`);
    app.import(`${app.bowerDirectory}/auth0.js/build/auth0.js`);
  }
};
