import Ember from 'ember';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

const {
  RSVP,
  get,
  inject
} = Ember;

export default BaseAuthenticator.extend({
  auth0: inject.service(),
  authenticate(impersonationData) {
    return new RSVP.Promise((resolve, reject) => {

      let auth0 = get(this, 'auth0').getAuth0Instance();

      auth0.getProfile(impersonationData.idToken, (err, profile) => {
        if (err) {
          return reject(err);
        }

        resolve(get(this, 'auth0').createSessionDataObject(profile, impersonationData));
      });
    });
  },

  restore(data) {
    return RSVP.resolve(data);
  },
});
