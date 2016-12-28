import Ember from 'ember';
import ApplicationRouteMixinMixin from 'ember-simple-auth-auth0/mixins/application-route-mixin';
import { moduleFor } from 'ember-qunit';
import test from 'ember-sinon-qunit/test-support/test';

const {
  get,
  getOwner,
  run,
  RSVP,
  Object: EmberObject
} = Ember;

const assign = Ember.assign || Ember.merge;

moduleFor('mixin:application-route-mixin', 'Unit | Mixin | application route mixin', {
  needs: ['service:session', 'service:auth0'],

  subject(options) {
    options = assign({
      _subscribeToSessionEvents() {
      }
    }, options);

    let ApplicationRouteMixinObject = EmberObject.extend(ApplicationRouteMixinMixin, options);

    this.register('test-container:application-route-mixin-object', ApplicationRouteMixinObject);
    return getOwner(this).lookup('test-container:application-route-mixin-object');
  }
});

test('it sets the correct expiration time if the exp is on idTokenPayload block', function(assert) {
  assert.expect(1);
  const subject = this.subject({
    session: {
      isAuthenticated: true,
      data: {
        authenticated: {
          idTokenPayload: {
            exp: 10,
          },
        },
      },
    },
    hasImpersonationData: true,
  });

  assert.equal(get(subject, '_expiresAt'), 10);
});

test('it sets the correct expiration time if the exp is on the authenticated block', function(assert) {
  assert.expect(1);
  const subject = this.subject({
    session: {
      isAuthenticated: true,
      data: {
        authenticated: {
          exp: 10,
        },
      },
    },
    hasImpersonationData: true,
  });

  assert.equal(get(subject, '_expiresAt'), 10);
});

test('it does not set the exp time if the user is not authenticated', function(assert) {
  assert.expect(1);
  const subject = this.subject({
    session: {
      isAuthenticated: false,
      data: {
        authenticated: {
          idTokenPayload: {
            exp: 10,
          },
        },
      },
    },
    hasImpersonationData: true,
  });

  assert.equal(get(subject, '_expiresAt'), 0);
});

test('it calls the auth0-impersonation authenticator if we have impersonation data', function(assert) {
  assert.expect(2);
  const subject = this.subject({
    session: {
      authenticate: this.stub().returns(RSVP.resolve())
    },
    _impersonationData: {
      idToken: 1
    },
    hasImpersonationData: true,
  });

  run(() => subject.beforeModel());

  assert.ok(subject.session.authenticate.calledOnce);
  assert.ok(subject.session.authenticate.calledWith('authenticator:auth0-impersonation', { idToken: 1 }));
});

test('it does not call the auth0-impersonation authenticator if we do not have impersonation data', function(assert) {
  assert.expect(1);
  const subject = this.subject({
    session: {
      authenticate: this.stub().returns(RSVP.resolve())
    },
    hasImpersonationData: false,
  });

  run(() => subject.beforeModel());

  assert.notOk(subject.session.authenticate.calledOnce);
});

test('it calls auth0.navigateToLogoutUrl() if the session is invalidated', function(assert) {
  assert.expect(1);
  const subject = this.subject({
    auth0: {
      navigateToLogoutURL: this.stub(),
    },
  });

  run(() => subject.sessionInvalidated());

  assert.ok(subject.auth0.navigateToLogoutURL.calledOnce);
});
