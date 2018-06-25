'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');
const webpack = require('webpack');

module.exports = {
  name: 'ember-simple-auth-auth0',
  options: {
    autoImport:{
      webpack: {
        plugins: [
          new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(EmberAddon.env())
          })
        ]
      }
    }
  }
};
