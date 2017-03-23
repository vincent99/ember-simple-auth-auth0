/* jshint node: true */
'use strict';
const path = require('path');
const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');
const Webpack = require('broccoli-webpack');
// var writeFile = require('broccoli-file-creator');
// var version = require('./package.json').version;
// var version = require('./bower.json').dependencies['auth0.js'];

function transformAMD(name) {
  return { using: [{ transformation: 'amd', as: name }] };
}

function webpackify(name, dir) {
  const fun = new Funnel(path.dirname(require.resolve(name + '/' + dir + '/index.js'), {
    destDir: name,
    files: ['index.js']
  }));
  return new Webpack([fun], {
    entry: [name + '/' + dir + '/index.js'],
    output: {
      filename: name + '.js',
      library: name,
      libraryTarget: 'umd'
    }
  });
}

module.exports = {
  name: 'ember-simple-auth-auth0',
  included: function(app) {
    this._super.included(app);

    app.import('vendor/auth0-js.js'               , transformAMD('auth0'                  ));
    app.import('vendor/auth0-lock.js'             , transformAMD('auth0-lock'             ));
    app.import('vendor/auth0-lock-passwordless.js', transformAMD('auth0-lock-passwordless'));

    // this.import('vendor/ember-simple-auth/register-version.js');
  },

  treeForVendor: function(vendorTree) {
      const trees = [];
      if(vendorTree) {
        trees.push(vendorTree);
      }

      // [XA] use webpack to transform the CommonJS libs to AMD so we can import 'em.

      trees.push(webpackify('auth0-js'               , 'src'));
      trees.push(webpackify('auth0-lock'             , 'lib'));
      trees.push(webpackify('auth0-lock-passwordless', 'lib'));

      return new MergeTrees(trees);

  //   var emberSimpleAuthAuth0 = 'Ember.libraries.register(\'Ember Simple Auth Auth0\', \'' + version + '\');\n';
  //   var auth0 = 'Ember.libraries.register(\'Auth0.js\', \'' + version + '\');\n';
  //   var lock = 'Ember.libraries.register(\'Auth0 Lock\', \'' + version + '\');\n';
  //   var passwordlessLock = 'Ember.libraries.register(\'Auth0 Lock Passwordless\', \'' + version + '\');\n';
  //   return writeFile('ember-simple-auth/register-version.js', content);
  }
};
