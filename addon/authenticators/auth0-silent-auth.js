import RSVP from 'rsvp';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Auth0UrlHashAuthenticator from 'ember-simple-auth-auth0/authenticators/auth0-url-hash';

export default Auth0UrlHashAuthenticator.extend({
  auth0: service(),
  authenticate(options) {
    return new RSVP.Promise((resolve, reject) => {
      // perform silent auth via auth0's checkSession function (called in the service);
      // if successful, use the same logic as the url-hash authenticator since the
      // result of checkSession is the same as parseHash.
      get(this, 'auth0').silentAuth(options).then(authenticatedData => {
        this._resolveAuthResult(authenticatedData, resolve, reject);
      }, reject);
    });
  }
});
