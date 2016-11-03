import Ember from 'ember';
import {
  moduleFor,
  test
} from 'ember-qunit';

const {
  get
} = Ember;

moduleFor('service:auth0', 'Unit | Service | auth0', {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
});

function windowLocation() {
  return [
    window.location.protocol,
    '//',
    window.location.host,
  ].join('');
}

test('it calculates the logoutURL correctly with rootURL', function(assert) {
  const config = {
    rootURL: '/test',
    ['ember-simple-auth']: {
      authenticationRoute: 'login',
      auth0: {}
    }
  };

  this.register('config:environment', config);

  let service = this.subject();
  assert.equal(get(service, 'logoutURL'),
    `${windowLocation()}${config.rootURL}/${config['ember-simple-auth'].authenticationRoute}`);
});

test('it calculates the logoutURL correctly with baseURL', function(assert) {
  const config = {
    baseURL: '/test',
    ['ember-simple-auth']: {
      authenticationRoute: 'login',
      auth0: {}
    }
  };

  this.register('config:environment', config);

  let service = this.subject();
  assert.equal(get(service, 'logoutURL'),
    `${windowLocation()}${config.baseURL}/${config['ember-simple-auth'].authenticationRoute}`);
});

test('it calculates the logoutURL correctly giving rootURL precedence', function(assert) {
  const config = {
    baseURL: '/test',
    rootURL: '/testroot',
    ['ember-simple-auth']: {
      authenticationRoute: 'login',
      auth0: {}
    }
  };

  this.register('config:environment', config);

  let service = this.subject();
  assert.equal(get(service, 'logoutURL'),
    `${windowLocation()}${config.rootURL}/${config['ember-simple-auth'].authenticationRoute}`);
});

test('it calculates the logoutURL correctly giving redirectURI precedence', function(assert) {
  const config = {
    rootURL: '/test',
    ['ember-simple-auth']: {
      authenticationRoute: 'login',
      auth0: {
        redirectURI: 'my-login'
      }
    }
  };

  this.register('config:environment', config);

  let service = this.subject();
  assert.equal(get(service, 'logoutURL'),
    `${windowLocation()}/${config['ember-simple-auth'].auth0.redirectURI}`);
});
