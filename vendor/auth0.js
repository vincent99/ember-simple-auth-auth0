(function() {
  /* globals define, auth0 */
  define('auth0', [], function() {
    'use strict';
    return { default: auth0.WebAuth};
  });
})();
