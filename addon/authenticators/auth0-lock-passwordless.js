import Ember from 'ember';
import Auth0BaseAuthenticator from 'ember-simple-auth-auth0/authenticators/auth0-base';

const {
  get,
  inject: {
    service
  },
  RSVP,
} = Ember;


export default Auth0BaseAuthenticator.extend({
  auth0: service(),
  authenticate(type, options, callback) {
    get(this, 'auth0').showPasswordlessLock(type, options).then(callback);
    return RSVP.reject();
  },
});
