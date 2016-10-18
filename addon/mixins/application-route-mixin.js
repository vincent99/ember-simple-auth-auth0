/* globals Auth0 */
import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

const {
  Mixin,
  getOwner,
  assert,
  computed,
  get,
  RSVP,
  inject: {
    service
  }
} = Ember;

export default Mixin.create(ApplicationRouteMixin, {
  auth0: service(),
  config: computed(function() {
    let applicationConfig = getOwner(this).resolveRegistration('config:environment');
    assert('ember-simple-auth config must be defined', applicationConfig['ember-simple-auth']);
    assert('ember-simple-auth.auth0 config must be defined', applicationConfig['ember-simple-auth'].auth0);

    return applicationConfig['ember-simple-auth'].auth0;
  }),
  /**
   * This has to be overridden because the default behavior prevents
   * auth0 to logout correctly.
   */
  sessionInvalidated() {
    get(this, 'auth0').navigateToLogoutURL();
  },

  beforeModel() {
    let promise = RSVP.resolve(this._super(...arguments));

    if (get(this, 'hasImpersonationData')) {
      promise = promise.then(() => this._authenticateAsImpersonator());
    }

    return promise;
  },

  hasImpersonationData: computed.notEmpty('_impersonationData'),

  _authenticateAsImpersonator() {
    let impersonationData = get(this, '_impersonationData');
    if (impersonationData && impersonationData.idToken) {
      return get(this, 'session').authenticate('authenticator:auth0-impersonation', impersonationData);
    }
  },

  _impersonationData: computed(function() {
    let auth0 = this._getAuth0Instance();
    return auth0.parseHash(window.location.hash);
  }),

  _getAuth0Instance() {
    return new Auth0({
      domain: get(this, 'config.domain'),
      clientID: get(this, 'config.clientID')
    });
  },
});
