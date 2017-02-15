import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

const {
  Mixin,
  computed,
  get,
  getWithDefault,
  set,
  RSVP,
  RSVP: {
    resolve
  },
  inject: {
    service
  },
  run,
  testing,
  deprecate,
  isPresent,
  isEmpty,
} = Ember;

export default Mixin.create(ApplicationRouteMixin, {
  session: service(),
  auth0: service(),

  sessionAuthenticated() {
    this._setupFutureEvents();
    this._super(...arguments);
  },

  /**
   * Hook that gets called after the jwt has expired
   * but before we notify the rest of the system.
   * Great place to add cleanup to expire any third-party
   * tokens or other cleanup.
   *
   * IMPORTANT: You must return a promise, else logout
   * will not continue.
   *
   * @return {Promise}
   */
  beforeSessionExpired() {
    return resolve();
  },

  /**
   * This has to be overridden because the default behavior prevents
   * auth0 to logout correctly.
   */
  sessionInvalidated() {
    this._clearJobs();
    // TODO: maybe don't do this or make it an option in the config
    get(this, 'auth0').navigateToLogoutURL();
  },

  beforeModel() {
    this._setupFutureEvents();
    let promise = resolve(this._super(...arguments));

    promise = promise.then(() => {
      return this._getUrlHashData()
        .then((urlHashData) => {
          if (isEmpty(urlHashData)) {
            return;
          }

          return this._authenticateWithUrlHash(urlHashData);
        });
    });

    return promise;
  },

  willDestroy() {
    this._clearJobs();
  },

  _authenticateWithUrlHash(urlHashData) {
    return get(this, 'session').authenticate('authenticator:auth0-url-hash', urlHashData);
  },

  _getUrlHashData() {
    if (get(this, 'auth0.isGreaterThanVersion8')) {
      return this._getNewUrlHashData();
    }

    return this._getDeprecatedUrlHashData();
  },

  _getNewUrlHashData() {
    const auth0 = get(this, 'auth0').getAuth0Instance();
    return new RSVP.Promise((resolve, reject) => {
      // TODO: Check to see if we cannot parse the hash or check to see which version of auth0 we are using.... ugh
      auth0.parseHash((err, parsedPayload) => {
        if (err) {
          if (err.errorDescription) {
            err.errorDescription = decodeURI(err.errorDescription);
          }

          return reject(err);
        }

        resolve(parsedPayload);
      });
    });
  },

  _getDeprecatedUrlHashData() {
    return new RSVP.Promise((resolve, reject) => {

      const auth0 = get(this, 'auth0').getAuth0Instance();
      const parsedPayload = auth0.parseHash();

      if (parsedPayload && parsedPayload.error && parsedPayload.error_description) {
        parsedPayload.errorDescription = decodeURI(parsedPayload.error_description);
        delete parsedPayload.error_description;
        return reject(parsedPayload);
      }

      return resolve(parsedPayload);
    });
  },
  _setupFutureEvents() {
    // Don't schedule expired events during testing, otherwise acceptance tests will hang.
    if (testing) {
      return;
    }

    this._scheduleExpire();
  },

  _scheduleExpire() {
    run.cancel(get(this, '_expireJob'));
    const expireInMilli = get(this, '_jwtRemainingTimeInSeconds') * 1000;
    const job = run.later(this, this._processSessionExpired, expireInMilli);
    set(this, '_expireJob', job);
  },

  /**
   * The current JWT's expire time
   * @return {Number in seconds}
   */
  _expiresAt: computed('session.data.authenticated', {
    get() {
      let exp = 0;

      if (!get(this, 'session.isAuthenticated')) {
        return exp;
      }

      const deprecatedExp = getWithDefault(this, 'session.data.authenticated.exp', null);
      const newExp = getWithDefault(this, 'session.data.authenticated.idTokenPayload.exp', null);

      if (isPresent(deprecatedExp)) {
        exp = deprecatedExp;

        deprecate(
          'Should use "idTokenPayload.exp" as the key for the expiration time instead of "exp" key on the session data',
          false,
          {
            id: 'ember-simple-auth-auth0.application-route-mixin._expiresAt',
            until: 'v3.0.0',
          });
      } else {
        exp = newExp;
      }

      return exp;
    }
  }),

  _jwtRemainingTimeInSeconds: computed('_expiresAt', {
    get() {
      let expiration = get(this, '_expiresAt') - (Date.now() / 1000);

      if (expiration < 0) {
        return 0;
      }

      return expiration;
    }
  }),

  _clearJobs() {
    run.cancel(get(this, '_expireJob'));
  },

  _processSessionExpired() {
    this.beforeSessionExpired()
      .then(() => {
        let session = get(this, 'session');

        if (get(session, 'isAuthenticated')) {
          session.invalidate();
        }
      });
  },
});
