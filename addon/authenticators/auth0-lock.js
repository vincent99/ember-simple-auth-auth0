import Ember from 'ember';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

const {
  getWithDefault,
  computed,
  computed: {
    readOnly,
    bool,
    notEmpty
  },
  RSVP,
  get,
  set,
  run,
  assert,
  inject
} = Ember;

export default BaseAuthenticator.extend({
  auth0: inject.service(),

  //=======================
  // Properties
  //=======================

  /**
   * The session data
   * @type {Ember Object}
   */
  sessionData: null,


  /**
   * The auth0 userID.
   * @return {String}
   */
  userID: readOnly('sessionData.profile.user_id'),

  /**
   * The access token.
   * @return {String}
   */
  accessToken: readOnly('sessionData.accessToken'),

  /**
   * The refresh token used to refresh the temporary access key.
   * @return {String}
   */
  refreshToken: readOnly('sessionData.refreshToken'),

  /**
   * Is there currently a refresh token
   * @return {Boolean}
   */
  hasRefreshToken: bool('refreshToken'),

  /**
   * The current session JWT.
   * @return {Base64 url encoded JWT}
   */
  jwt: readOnly('sessionData.jwt'),

  /**
   * Is there currently a jwt?
   * @return {Boolean}
   */
  hasJWT: notEmpty('jwt'),

  /**
   * The current JWT's expire time
   * @return {Number in seconds}
   */
  expiresIn: computed('sessionData.exp', function() {
    return getWithDefault(this, 'sessionData.exp', 0);
  }),

  jwtRemainingTime: computed('expiresIn', function() {
    if (get(this, 'expiresIn') <= 0) {
      return 0;
    } else {
      let currentTime = (new Date().getTime() / 1000);
      return get(this, 'expiresIn') - currentTime;
    }
  }),

  init() {
    set(this, 'sessionData', Ember.Object.create());

    this._super(...arguments);
  },

  //=======================
  // Hooks
  //=======================

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
  beforeExpire() {
    return RSVP.resolve();
  },

  restore(data) {

    get(this, 'sessionData').setProperties(data);

    if (get(this, 'jwtRemainingTime') < 1) {
      if (get(this, 'hasRefreshToken')) {
        return this._refreshAuth0Token();
      } else {
        return RSVP.reject();
      }
    } else {
      this._setupFutureEvents();

      return RSVP.resolve(data);
    }
  },

  authenticate(options) {
    assert('Options must be passed to authenticate in order to create the Auth0Instance', options);

    let lock = get(this, 'auth0').getAuth0LockInstance(options);

    return new RSVP.Promise((resolve, reject) => {
      lock.on('unrecoverable_error', reject);
      lock.on('authorization_error', reject);
      lock.on('authenticated', (authenticatedData) => {
        lock.getProfile(authenticatedData.idToken, (error, profile) => {
          if (error) {
            return reject(error);
          }

          let sessionData = get(this, 'auth0').createSessionDataObject(profile, authenticatedData);

          get(this, 'sessionData').setProperties(sessionData);
          this._setupFutureEvents(sessionData);
          resolve(sessionData);
        });
      });

      lock.show();
    });
  },

  redirectURL: computed(function() {
    let loginURI = get(this, 'auth0.redirectURI');
    return [
      window.location.protocol,
      '//',
      window.location.host,
      '/',
      loginURI
    ].join('');
  }),

  invalidate(/* data */) {
    window.location.replace(`https://${get(this, 'auth0.domain')}/v2/logout?returnTo=${get(this,
      'redirectURL')}&client_id=${get(this, 'auth0.clientID')}`);

    return this._super(...arguments);
  },

  //=======================
  // Private Methods
  //=======================
  _setupFutureEvents() {
    this._clearJobs();
    this._scheduleExpire();

    if (get(this, 'hasRefreshToken')) {
      this._scheduleRefresh();
    }
  },

  _scheduleRefresh() {
    run.cancel(get(this, '_refreshJob'));

    let remaining = get(this, 'jwtRemainingTime');
    let earlyRefresh = 30;
    let refreshInSecond = (remaining < (earlyRefresh * 2)) ? remaining / 2 : remaining - earlyRefresh;
    let refreshInMilli = refreshInSecond * 1000;

    if (!isNaN(refreshInMilli) && refreshInMilli >= 50) {
      let job = run.later(this, this._refreshAccessToken, refreshInMilli);
      set(this, '_refreshJob', job);
    }
  },

  _scheduleExpire() {
    run.cancel(get(this, '_expireJob'));
    let expireInMilli = get(this, 'jwtRemainingTime') * 1000;
    let job = run.later(this, this._processSessionExpired, expireInMilli);
    set(this, '_expireJob', job);
  },

  _clearJobs() {
    run.cancel(get(this, '_expireJob'));
    run.cancel(get(this, '_refreshJob'));
  },

  _processSessionExpired() {
    this.beforeExpire().then(() => this.invalidate());
  },

  _refreshAuth0Token() {
    return new RSVP.Promise((resolve, reject) => {
      let auth0 = get(this, 'auth0').getAuth0Instance();
      auth0.refreshToken(get(this, 'refreshToken'), (err, result) => {
        if (err) {
          reject(err);
        } else {

          let iat = get(this, 'iat');
          get(this, 'sessionData').setProperties({
            jwt: result.id_token,
            exp: iat + result.expires_in
          });
          // this.afterRefresh({
          //   jwt: result.id_token
          // });

          this._setupFutureEvents();
        }
      });
    });
  },

  _refreshAccessToken() {
    this._refreshAuth0Token().then(data => this.trigger('sessionDataUpdated', data));
  },
});
