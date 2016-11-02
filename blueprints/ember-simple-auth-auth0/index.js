/*jshint node:true*/

module.exports = {
  description: '',
  normalizeEntityName() {}, // no-op since we're just adding dependencies
  afterInstall() {
    return this.addBowerPackagesToProject(['auth0-lock', 'auth0.js']);
  }
};
