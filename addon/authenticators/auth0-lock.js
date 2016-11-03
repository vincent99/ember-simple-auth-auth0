import Ember from 'ember';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
import createSessionDataObject from '../utils/create-session-data-object';

const {
  RSVP,
  get,
  inject: {
    service
  }
} = Ember;

const assign = Ember.assign || Ember.merge;

export default BaseAuthenticator.extend({
  auth0: service(),
  authenticate(options) {
    let defaultOptions = {
      autoclose: true,
      auth: {
        redirect: false,
        params: {
          scope: 'openid'
        }
      }
    };

    options = assign(defaultOptions, options);

    return new RSVP.Promise((resolve, reject) => {
      const lock = get(this, 'auth0').getAuth0LockInstance(options);
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

      lock.show();
    });
  },

  restore(data) {
    return RSVP.resolve(data);
  },

  invalidate() {
    get(this, 'auth0').navigateToLogoutURL();
    return this._super(...arguments);
  },
});
