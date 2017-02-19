import Ember from 'ember';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

const {
  RSVP,
  get,
  inject: {
    service
  },
  isEmpty,
  getProperties,
  deprecate
} = Ember;

export default BaseAuthenticator.extend({
  auth0: service(),
  restore(data) {
    const {
      jwt,
      exp,
    } = getProperties(data, 'jwt', 'exp');

    deprecate(
      'Should use "idToken" as the key for the authorization token instead of "jwt" key on the session data',
      isEmpty(jwt), {
        id: 'ember-simple-auth-auth0.authenticators.auth0-base.restore',
        until: 'v3.0.0',
      });

    deprecate(
      'Should use "idTokenPayload.exp" as the key for the expiration time instead of "exp" key on the session data',
      isEmpty(exp), {
        id: 'ember-simple-auth-auth0.authenticators.auth0-base.restore',
        until: 'v3.0.0',
      });

    return RSVP.resolve(data);
  },

  invalidate() {
    deprecate(
      'session.invalidate will no longer navigate to the auth0 logout url. Please call auth0.navigateToLogoutURL yourself when needed.',
      false, {
        id: 'ember-simple-auth-auth0.authenticators.auth0-base.invalidate',
        until: 'v3.0.0',
      });

    get(this, 'auth0').navigateToLogoutURL();
    return this._super(...arguments);
  },
});
