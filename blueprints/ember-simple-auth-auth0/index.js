/*jshint node:true*/

module.exports = {
  description: '',

  normalizeEntityName: function() {}, // no-op since we're just adding dependencies

  afterInstall() {
    return this.addBowerPackagesToProject([
      {
        name: 'auth0-lock',
        target: '^10.0.2'
      },
      {
        name: 'auth0.js',
        target: '^7.0.4'
      }
    ]);
  }
};
