import Ember from 'ember';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
import createSessionDataObject from '../utils/create-session-data-object';

const {
  RSVP,
  get,
  getProperties,
  inject: {
    service
  },
  isEmpty,
  deprecate,
  isPresent,
} = Ember;

export default BaseAuthenticator.extend({
  auth0: service(),
  session: service(),
  authenticate(impersonationData) {
    return new RSVP.Promise((resolve, reject) => {
      if (isEmpty(impersonationData)) {
        reject();
      }

      const auth0 = get(this, 'auth0').getAuth0Instance();

      auth0.getUserInfo(impersonationData.accessToken, (err, profile) => {
        if (err) {
          return reject(err);
        }

        resolve(createSessionDataObject(profile, impersonationData));
      });
    });
  },

  restore(data) {
    const {
      jwt,
      exp,
    } = getProperties(data, 'jwt', 'exp');

    deprecate(
      'Should use "idToken" as the key for the authorization token instead of "jwt" key on the session data',
      isPresent(jwt), {
        id: 'ember-simple-auth-auth0.authenticators.auth0-impersonation.restore',
        until: 'v3.0.0',
      });


    deprecate(
      'Should use "idTokenPayload.exp" as the key for the expiration time instead of "exp" key on the session data',
      isPresent(exp), {
        id: 'ember-simple-auth-auth0.authenticators.auth0-impersonation.restore',
        until: 'v3.0.0',
      });

    return RSVP.resolve(data);
  }
});
