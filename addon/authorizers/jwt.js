import Ember from 'ember';
import BaseAuthorizer from 'ember-simple-auth/authorizers/base';
const {
  isEmpty,
  deprecate,
  isPresent,
  debug
} = Ember;

export default BaseAuthorizer.extend({
  authorize(sessionData, block) {
    let userToken = sessionData['idToken'];

    if (isEmpty(userToken)) {
      userToken = sessionData['jwt'];
      deprecate(
        'Should use "idToken" as the key for the authorization token instead of "jwt" key on the session data',
        false, {
          id: 'ember-simple-auth-auth0.authorizer.jwt.authorize',
          until: 'v3.0.0',
        });
    }

    if (isPresent(userToken)) {
      block('Authorization', `Bearer ${userToken}`);
    } else {
      debug('Could not find the authorization token in the session data for the jwt authorizer.');
    }
  }
});
