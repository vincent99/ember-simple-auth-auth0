import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

const {
  Mixin,
  computed,
  computed: {
    notEmpty
  },
  get,
  set,
  RSVP: {
    resolve
  },
  inject: {
    service
  },
  run,
  testing,
  deprecate,
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
    get(this, 'auth0').navigateToLogoutURL();
  },

  beforeModel() {
    this._setupFutureEvents();
    let promise = resolve(this._super(...arguments));

    if (get(this, 'hasImpersonationData')) {
      promise = promise.then(() => this._authenticateAsImpersonator());
    }

    return promise;
  },

  willDestroy() {
    this._clearJobs();
  },

  hasImpersonationData: notEmpty('_impersonationData.idToken'),

  _authenticateAsImpersonator() {
    const impersonationData = get(this, '_impersonationData');
    return get(this, 'session').authenticate('authenticator:auth0-impersonation', impersonationData);
  },

  _impersonationData: computed(function() {
    const auth0 = get(this, 'auth0').getAuth0Instance();
    return auth0.parseHash(window.location.hash);
  }),

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

      const authenticatedData = get(this, 'session.data.authenticated');
      const idTokenPayload = get(authenticatedData, 'idTokenPayload');

      let exp = 0;

      if (isEmpty(idTokenPayload)) {
        exp = get(authenticatedData, 'exp');

        deprecate(
          'Should use "idTokenPayload.exp" as the key for the expiration time instead of "exp" key on the session data',
          false,
          {
            id: 'ember-simple-auth-auth0.application-route-mixin._expiresAt',
            until: 'v3.0.0',
          });
      } else {
        exp = get(idTokenPayload, 'exp');
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
