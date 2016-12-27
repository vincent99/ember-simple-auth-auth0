import Ember from 'ember';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
import createSessionDataObject from '../utils/create-session-data-object';

const {
  RSVP,
  get,
  inject: {
    service
  },
} = Ember;

const assign = Ember.assign || Ember.merge;

export default BaseAuthenticator.extend({
  auth0: service(),
  authenticate(event, returnAuthenticatedData, returnProfileData) {
    let defaultAuthenticatedData = {
      idToken: '1'
    };

    returnAuthenticatedData = assign(defaultAuthenticatedData, returnAuthenticatedData);

    return new RSVP.Promise((resolve, reject) => {
      const lock = get(this, 'auth0').getAuth0LockInstance();

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

      lock.getProfile = function(token, callback) {
        return callback(null, returnProfileData);
      };

      lock.emit(event, returnAuthenticatedData);
    });
  },

  restore(data) {
    return RSVP.resolve(data);
  },

  invalidate() {
    return RSVP.resolve();
  }
});
