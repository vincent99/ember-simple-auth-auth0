/*jshint node:true*/
const RSVP = require('rsvp');

module.exports = {
  description: '',
  normalizeEntityName() {
  }, // no-op since we're just adding dependencies
  afterInstall() {
    return RSVP.all([
      this.addPackageToProject('ember-simple-auth'),
      this.addBowerPackagesToProject([
        {
          name: 'auth0-lock'
        },
        {
          name: 'auth0.js'
        }
      ])
    ]);
  }
};
