/* globals Auth0Lock, Auth0 */
import Ember from 'ember';

const {
  Service,
  computed,
  computed: {
    readOnly
  },
  get,
  getOwner,
  assert,
} = Ember;

export default Service.extend({
  /**
   * The env config found in the environment config.
   * ENV['auth0-ember-simple-auth']
   *
   * @type {Object}
   */
  config: computed(function() {
    let applicationConfig = getOwner(this).resolveRegistration('config:environment');
    assert('ember-simple-auth config must be defined', applicationConfig['ember-simple-auth']);
    assert('ember-simple-auth.auth0 config must be defined', applicationConfig['ember-simple-auth'].auth0);

    return applicationConfig['ember-simple-auth'].auth0;
  }),

  /**
   * The Auth0 App ClientID found in your Auth0 dashboard
   * @type {String}
   */
  clientID: readOnly('config.clientID'),

  /**
   * The Auth0 App Domain found in your Auth0 dashboard
   * @type {String}
   */
  domain: readOnly('config.domain'),

  redirectURI: readOnly('config.redirectURI'),

  getAuth0LockInstance(options) {
    return new Auth0Lock(
      get(this, 'clientID'),
      get(this, 'domain'),
      options
    );
  },

  getAuth0Instance() {
    return new Auth0({
      domain: get(this, 'domain'),
      clientID: get(this, 'clientID')
    });
  },

  createSessionDataObject(profile, tokenInfo) {
    return {
      profile,
      impersonated: profile.impersonated,
      impersonator: profile.impersonator,
      jwt: tokenInfo.idToken,
      exp: tokenInfo.idTokenPayload.exp,
      iat: tokenInfo.idTokenPayload.iat,
      accessToken: tokenInfo.accessToken,
      refreshToken: tokenInfo.refreshToken
    };
  }
});
