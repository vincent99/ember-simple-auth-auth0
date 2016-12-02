import Ember from 'ember';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
import createSessionDataObject from '../utils/create-session-data-object';

const {
  assert,
  RSVP,
  get,
  inject: {
    service
  },
  isPresent,
  getProperties,
  deprecate
} = Ember;

const assign = Ember.assign || Ember.merge;
const validPasswordlessTypes = [
  'sms',
  'magiclink',
  'emailcode'
];

export default BaseAuthenticator.extend({
  auth0: service(),
  authenticate(type, options) {
    assert(`You must pass in a valid type to auth0-passwordless authenticator. Valid types: ${validPasswordlessTypes.toString()}`,
      validPasswordlessTypes.indexOf(type) > -1);

    let defaultOptions = {
      auth: {
        params: {
          scope: 'openid'
        }
      }
    };

    options = assign(defaultOptions, options);

    assert('You must pass in a valid callbackURL in the options block to auth0-passwordless authenticator.',
      options.callbackURL);

    return new RSVP.Promise((resolve, reject) => {
      const lock = get(this, 'auth0').getAuth0LockPasswordlessInstance();
      lock.on('unrecoverable_error', reject);
      lock.on('authorization_error', reject);
      lock.on('authenticated', (authenticatedData) => {
        lock.getProfile(authenticatedData.idToken, (error, profile) => {
          if (error) {
            return reject(error);
          }

          resolve(createSessionDataObject(profile, authenticatedData));
        });
      });

      lock[type](options);
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
        id: 'ember-simple-auth-auth0.authenticators.auth0-lock.restore',
        until: 'v3.0.0',
      });

    deprecate(
      'Should use "idTokenPayload.exp" as the key for the expiration time instead of "exp" key on the session data',
      isPresent(exp), {
        id: 'ember-simple-auth-auth0.authenticators.auth0-lock.restore',
        until: 'v3.0.0',
      });

    return RSVP.resolve(data);
  },

  invalidate() {
    get(this, 'auth0').navigateToLogoutURL();
    return this._super(...arguments);
  },
});
