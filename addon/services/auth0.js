/* globals Auth0Lock, Auth0 */
import Ember from 'ember';

const {
  Service,
  computed,
  computed: {
    readOnly
  },
  get,
  getProperties,
  getOwner,
  assert,
  testing,
  isPresent
} = Ember;

export default Service.extend({
  /**
   * The env config found in the environment config.
   * ENV['auth0-ember-simple-auth']
   *
   * @type {Object}
   */
  config: computed(function() {
    let emberSimpleAuthConfig = get(this, '_emberSimpleAuthConfig');
    assert('ember-simple-auth config must be defined', emberSimpleAuthConfig);
    assert('ember-simple-auth.auth0 config must be defined', emberSimpleAuthConfig.auth0);

    return emberSimpleAuthConfig.auth0;
  }),

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
  },

  navigateToLogoutURL() {
    const {
      domain,
      redirectURL,
      clientID
    } = getProperties(this, 'domain', 'redirectURL', 'clientID');

    if (!testing) {
      window.location.replace(`https://${domain}/v2/logout?returnTo=${redirectURL}&client_id=${clientID}`);
    }
  },

  _environmentConfig: computed({
    get() {
      return getOwner(this).resolveRegistration('config:environment');
    }
  }),

  _emberSimpleAuthConfig: computed({
    get() {
      return get(this, '_environmentConfig')['ember-simple-auth'];
    }
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

  redirectURL: computed({
    get() {
      let loginURI = get(this, '_loginURI');

      return [
        window.location.protocol,
        '//',
        window.location.host,
        '/',
        loginURI
      ].join('');
    }
  }),

  _loginURI: computed({
    get() {
      let redirectURI = get(this, '_redirectURI');
      let loginURI = `${get(this, '_rootURL')}/${get(this, '_authenticationRoute')}`;
      if (isPresent(redirectURI)) {
        loginURI = redirectURI;
      }

      // Strip all leading / (slash) because we will add it back in during the redirectURL creation
      return loginURI.replace(/(^[/\s]+)/g, '');
    }
  }),
  _redirectURI: readOnly('config.redirectURI'),
  _rootURL: computed({
    get() {
      let rootURL = get(this, '_environmentConfig.rootURL');
      if (isPresent(rootURL)) {
        return rootURL;
      }

      // NOTE: this is for backwards compatibility for those who are not yet using rootURL
      return get(this, '_baseURL');
    }
  }),

  _baseURL: readOnly('_environmentConfig.baseURL'),
  _authenticationRoute: readOnly('_emberSimpleAuthConfig.authenticationRoute')
});
