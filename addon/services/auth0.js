import Ember from 'ember';
import Auth0 from 'auth0';
import Auth0Lock from 'auth0-lock';
import Auth0LockPasswordless from 'auth0-lock-passwordless';
import createSessionDataObject from '../utils/create-session-data-object';

const {
  Service,
  computed,
  computed: {
    readOnly,
  },
  deprecate,
  get,
  getOwner,
  getProperties,
  assert,
  testing,
  isPresent,
  isEmpty,
  inject: {
    service
  },
  RSVP,
} = Ember;

const assign = Ember.assign || Ember.merge;

const validPasswordlessTypes = [
  'sms',
  'magiclink',
  'emailcode'
];

export default Service.extend({
  session: service(),
  /**
   * The env config found in the environment config.
   * ENV['ember-simple-auth'].auth0
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

  isGreaterThanVersion8: computed(function() {
    const isGreaterThanVersion8 = semver.satisfies(Auth0.version, '>=8');

    deprecate(
      'Please use the new version of auth0; version >= 8.x.x',
      isGreaterThanVersion8, {
        id: 'ember-simple-auth-auth0',
        until: 'v3.0.0',
        url: 'https://auth0.com/docs/libraries/auth0js/migration-guide'
      });

    return isGreaterThanVersion8;
  }),

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

  showLock(options, clientID = null, domain = null) {
    let defaultOptions = {
      autoclose: true,
      auth: {
        redirect: false,
        params: {
          scope: 'openid'
        }
      }
    };

    options = assign(defaultOptions, options);

    return new RSVP.Promise((resolve, reject) => {
      const lock = this.getAuth0LockInstance(options, clientID, domain);
      this._setupLock(lock, resolve, reject);
      lock.show();
    });
  },

  showPasswordlessLock(type, options, clientID = null, domain = null) {
    assert(`You must pass in a valid type to auth0-lock-passwordless authenticator. Valid types: ${validPasswordlessTypes.toString()}`,
      validPasswordlessTypes.indexOf(type) > -1);

    let defaultOptions = {
      auth: {
        params: {
          scope: 'openid'
        }
      }
    };

    options = assign(defaultOptions, options);

    return new RSVP.Promise((resolve) => {
      const lock = this.getAuth0LockPasswordlessInstance(clientID, domain);
      lock[type](options, (...args) => resolve(...args));
    });
  },

  _setupLock(lock, resolve, reject) {
    lock.on('unrecoverable_error', reject);
    lock.on('authorization_error', reject);
    lock.on('authenticated', (authenticatedData) => {
      if (isEmpty(authenticatedData)) {
        return reject(new Error('The authenticated data did not come back from the request'));
      }

      lock.getProfile(authenticatedData.idToken, (error, profile) => {
        if (error) {
          return reject(error);
        }

        resolve(createSessionDataObject(profile, authenticatedData));
      });
    });
  },

  getAuth0LockInstance(options, clientID = null, domain = null) {
    clientID = clientID || get(this, 'clientID');
    domain = domain || get(this, 'domain');

    return new Auth0Lock(clientID, domain, options);
  },

  getAuth0Instance(clientID = null, domain = null) {
    clientID = clientID || get(this, 'clientID');
    domain = domain || get(this, 'domain');

    let Auth0Constructor = Auth0;

    if (get(this, 'isGreaterThanVersion8')) {
      Auth0Constructor = Auth0.WebAuth;
    }

    return new Auth0Constructor({
      domain,
      clientID
    });
  },

  getAuth0LockPasswordlessInstance(clientID = null, domain = null) {
    clientID = clientID || get(this, 'clientID');
    domain = domain || get(this, 'domain');

    return new Auth0LockPasswordless(clientID, domain);
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
  _authenticationRoute: computed({
    get() {
      const applicationController = getOwner(this).lookup('route:application');
      if (isPresent(applicationController)) {
        let authenticationRoute = get(applicationController, 'authenticationRoute');

        if (isPresent(authenticationRoute)) {
          return authenticationRoute;
        }
      }

      return get(this, ('_emberSimpleAuthConfig.authenticationRoute'));
    }
  }),
});
