import Ember from 'ember';
import BaseAuthorizer from 'ember-simple-auth/authorizers/base';
const {
  isEmpty
} = Ember;

export default BaseAuthorizer.extend({
  authorize(sessionData, block) {
    const userToken = sessionData['idToken'];

    if (!isEmpty(userToken)) {
      block('Authorization', `Bearer ${userToken}`);
    }
  }
});
