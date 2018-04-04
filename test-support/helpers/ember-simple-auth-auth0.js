import Ember from 'ember';
import createSessionDataObject from 'ember-simple-auth-auth0/utils/create-session-data-object';

const {
  RSVP,
  set
} = Ember;

export function mockAuth0Lock(app, sessionData) {
  const { __container__ : container } = app;
  const auth0 = container.lookup('service:auth0');
  set(auth0, 'test_showLock', auth0.showLock.bind(auth0));

  auth0.showLock = function() {
    return RSVP.resolve(createSessionDataObject({}, sessionData));
  }.bind(auth0);

  return wait();
}
