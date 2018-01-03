import Ember from 'ember';

const {
  RSVP,
  set
} = Ember;

export function mockAuth0Lock(app, sessionData) {
  const { __container__ : container } = app;
  const auth0 = container.lookup('service:auth0');
  set(auth0, 'test_showLock', auth0.showLock.bind(auth0));

  auth0.showLock = function() {
    return RSVP.resolve(sessionData);
  }.bind(auth0);

  // TODO: remove this evil hack
  // [XA] There's a current issue where session expiration isn't handled
  //      properly in tests, and it's blocking the Lock v11 migration.
  //      For now, let's zap the invalidation handling and laugh evilly.
  //      (I'd target _processSessionExpired but I can't lookup the app route:
  //       see https://github.com/emberjs/ember.js/issues/14716 )
  //      I'll remove this hack once I fix up the session expiration code,
  //      so this is very much temporary.
  const session = container.lookup('service:session');
  session.invalidate = function() {}

  return wait();
}
