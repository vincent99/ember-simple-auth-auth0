import Ember from 'ember';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
import getSessionExpiration from '../utils/get-session-expiration';
import now from '../utils/now';

const {
  RSVP,
  inject: {
    service
  },
} = Ember;

export default BaseAuthenticator.extend({
  auth0: service(),
  restore(data) {
    const expiresAt = getSessionExpiration(data || {});
    if(expiresAt > now()) {
      return RSVP.resolve(data);
    } else {
      return RSVP.reject();
    }
  },
});
