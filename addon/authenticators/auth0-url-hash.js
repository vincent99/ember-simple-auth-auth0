import Ember from 'ember';
import Auth0BaseAuthenticator from 'ember-simple-auth-auth0/authenticators/auth0-base';
import createSessionDataObject from '../utils/create-session-data-object';

const {
  RSVP,
  get,
  inject: {
    service
  },
  isEmpty,
} = Ember;

export default Auth0BaseAuthenticator.extend({
  auth0: service(),
  session: service(),
  authenticate(urlHashData) {
    return new RSVP.Promise((resolve, reject) => {
      if (isEmpty(urlHashData)) {
        reject();
      }
      const auth0 = get(this, 'auth0').getAuth0Instance();
      let getUserInfo = () => {};

      // Handle auth0.js v8.x.x
      if (get(this, 'auth0.isGreaterThanVersion8')) {
        getUserInfo = auth0.client.userInfo.bind(auth0.client);
      } else {
        getUserInfo = auth0.getUserInfo.bind(auth0);
      }

      getUserInfo(urlHashData.accessToken, (err, profile) => {
        if (err) {
          return reject(err);
        }

        resolve(createSessionDataObject(profile, urlHashData));
      });
    });
  },
});
