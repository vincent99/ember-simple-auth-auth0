import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from '../../../tests/helpers/module-for-acceptance';
import { authenticateSession, currentSession } from 'dummy/tests/helpers/ember-simple-auth';
import { mockAuth0Lock } from 'dummy/tests/helpers/ember-simple-auth-auth0';
import page from '../../pages/login';

const {
  get
} = Ember;

moduleForAcceptance('Acceptance | login');

test('visiting /login goes to login page if unauthenticated', function(assert) {
  assert.expect(1);
  page.visit();

  andThen(() => {
    assert.equal(currentURL(), '/login');
  });
});

test('visiting /login redirects to /protected page if authenticated', function(assert) {
  assert.expect(1);
  page.visit();
  authenticateSession(this.application);

  andThen(() => {
    assert.equal(currentURL(), '/protected');
  });
});

test('it mocks the auth0 lock login and logs in the user', function(assert) {
  assert.expect(2);
  const sessionData = {
    idToken: 1,
    expiresIn: 3600
  };

  mockAuth0Lock(this.application, sessionData);

  page
    .visit()
    .login();

  andThen(() => {
    let session = currentSession(this.application);
    let idToken = get(session, 'data.authenticated.idToken');
    assert.equal(idToken, sessionData.idToken);
    assert.equal(currentURL(), '/protected');
  });
});

test('it mocks the auth0 lock login again and logs in a different user', function(assert) {
  assert.expect(2);
  const sessionData = {
    idToken: 2,
    expiresIn: 3600
  };

  mockAuth0Lock(this.application, sessionData);

  page
    .visit()
    .login();

  andThen(() => {
    let session = currentSession(this.application);
    let idToken = get(session, 'data.authenticated.idToken');
    assert.equal(idToken, sessionData.idToken);
    assert.equal(currentURL(), '/protected');
  });
});
