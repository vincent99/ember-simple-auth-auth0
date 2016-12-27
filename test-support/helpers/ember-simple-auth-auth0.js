import Ember from 'ember';

const {
  getOwner
} = Ember;

import Test from 'ember-simple-auth-auth0/authenticators/auth0-test';

const TEST_CONTAINER_KEY = 'authenticator:auth0-test';

function ensureAuthenticator(app, container) {
  const authenticator = container.lookup(TEST_CONTAINER_KEY);
  if (!authenticator) {
    app.register(TEST_CONTAINER_KEY, Test);
  }
}

export function emit(app, event, eventData) {
  const auth0TestInstance = app.lookup('auth0-test-instance');
  auth0TestInstance.emit(event, eventData);
}
