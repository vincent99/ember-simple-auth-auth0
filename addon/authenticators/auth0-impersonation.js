import Ember from 'ember';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
import createSessionDataObject from '../utils/create-session-data-object';

const {
  RSVP,
  get,
  inject: {
    service
  },
  isEmpty
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
    return RSVP.resolve(data);
  }
});
