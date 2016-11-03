/* globals Auth0Lock, Auth0 */
import Ember from 'ember';
import getOwner from 'ember-getowner-polyfill';

const {
  Service,
  computed,
  computed: {
    readOnly,
  },
  get,
  getProperties,
  assert,
  testing,
  isPresent,
  inject: {
    service
  }
} = Ember;

export default Service.extend({
  session: service(),
  /**
   * The env config found in the environment config.
   * ENV['auth0-ember-simple-auth']
   *
   * @type {Object}
   */
  config: computed({
    get() {
      const emberSimpleAuthConfig = get(this, '_emberSimpleAuthConfig');
      assert('ember-simple-auth config must be defined', emberSimpleAuthConfig);
      assert('ember-simple-auth.auth0 config must be defined', emberSimpleAuthConfig.auth0);

      return emberSimpleAuthConfig.auth0;
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

  logoutURL: computed({
    get() {
      const loginURI = get(this, '_loginURI');
      let location = `${window.location.protocol}//${window.location.host}`;

      if (isPresent(loginURI)) {
        location += `/${loginURI}`;
      }

      return location;
    }
  }),

  getAuth0LockInstance(options) {
    const {
      domain,
      clientID
    } = getProperties(this, 'domain', 'clientID');

    return new Auth0Lock(clientID, domain, options);
  },

  getAuth0Instance() {
    const {
      domain,
      clientID
    } = getProperties(this, 'domain', 'clientID');

    return new Auth0({
      domain,
      clientID
    });
  },

  navigateToLogoutURL() {
    const {
      domain,
      logoutURL,
      clientID
    } = getProperties(this, 'domain', 'logoutURL', 'clientID');

    if (!testing) {
      window.location.replace(`https://${domain}/v2/logout?returnTo=${logoutURL}&client_id=${clientID}`);
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

  _loginURI: computed({
    get() {
      const {
        _redirectURI,
        _rootURL,
        _authenticationRoute,
      } = getProperties(this, '_redirectURI', '_rootURL', '_authenticationRoute');

      let loginURI = _rootURL;

      if (isPresent(_authenticationRoute)) {
        loginURI += `/${_authenticationRoute}`;
      }

      if (isPresent(_redirectURI)) {
        loginURI = _redirectURI;
      }

      // Strip all leading / (slash) because we will add it back in during the logoutURL creation
      return loginURI.replace(/(^[/\s]+)/g, '');
    }
  }),
  _redirectURI: readOnly('config.redirectURI'),
  _rootURL: computed({
    get() {
      const rootURL = get(this, '_environmentConfig.rootURL');
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
