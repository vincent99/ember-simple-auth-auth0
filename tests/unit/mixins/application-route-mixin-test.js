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

test('it sets the correct expiration time if the expiresIn exists', function(assert) {
  assert.expect(1);
  const issuedAt = Math.ceil(Date.now() / 1000);
  const subject = this.subject({
    session: {
      isAuthenticated: true,
      data: {
        authenticated: {
          expiresIn: 10,
          idTokenPayload: {
            iat: issuedAt
          }
        },
      },
    },
  });

  assert.equal(get(subject, '_expiresAt'), issuedAt + 10);
});

test('it does not set the exp time if the user is not authenticated', function(assert) {
  assert.expect(1);
  const subject = this.subject({
    session: {
      isAuthenticated: false,
      data: {
        authenticated: {
          expiresIn: 10,
        },
      },
    },
  });

  assert.equal(get(subject, '_expiresAt'), 0);
});

test('it calls the auth0-url-hash authenticator if we have url hash data', function(assert) {
  assert.expect(2);
  const subject = this.subject({
    session: {
      authenticate: this.stub().returns(RSVP.resolve())
    },
    _getUrlHashData: this.stub().returns(RSVP.resolve({
      idToken: 1
    })),
  });

  run(() => subject.beforeModel());

  assert.ok(subject.session.authenticate.calledOnce);
  assert.ok(subject.session.authenticate.calledWith('authenticator:auth0-url-hash', { idToken: 1 }));
});

test('it does not call the auth0-url-hash authenticator if we do not have url hash data', function(assert) {
  assert.expect(1);
  const subject = this.subject({
    session: {
      authenticate: this.stub().returns(RSVP.resolve())
    },
    _getUrlHashData: this.stub().returns(RSVP.resolve()),
  });

  run(() => subject.beforeModel());

  assert.notOk(subject.session.authenticate.calledOnce);
});
