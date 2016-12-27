/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-simple-auth-auth0',
  included: function(app) {
    this._super.included(app);

    app.import(app.bowerDirectory + '/auth0-lock/build/lock.js');
    app.import(app.bowerDirectory + '/auth0.js/build/auth0.js');

    app.import('vendor/lock.js', {
      exports: {
        'auth0-lock': ['default']
      }
    });

    app.import('vendor/auth0.js', {
      exports: {
        'auth0': ['default']
      }
    });
  }
};
