import Ember from 'ember';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

const {
  RSVP,
  inject: {
    service
  },
} = Ember;

export default BaseAuthenticator.extend({
  auth0: service(),
  restore(data) {
    return RSVP.resolve(data);
  },
});
