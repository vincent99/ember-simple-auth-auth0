import Ember from 'ember';
import Auth0BaseAuthenticator from 'ember-simple-auth-auth0/authenticators/auth0-base';

const {
  get,
  inject: {
    service
  },
  RSVP,
  typeOf,
} = Ember;

export default Auth0BaseAuthenticator.extend({
  auth0: service(),
  authenticate(type, options, callback) {
    if (typeOf(options) === 'function') {
      callback = options;
      options = {};
    }

    get(this, 'auth0').showPasswordlessLock(type, options).then(callback);
    // NOTE: Always reject here so that the developer can use the proxied callback without being redirected to an authenticated state.
    // Which is the default behavior.
    return RSVP.reject();
  },
});
