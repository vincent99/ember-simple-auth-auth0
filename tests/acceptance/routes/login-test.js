import { test } from 'qunit';
import moduleForAcceptance from '../../../tests/helpers/module-for-acceptance';
import { authenticateSession } from 'dummy/tests/helpers/ember-simple-auth';

moduleForAcceptance('Acceptance | login');

test('visiting /login goes to login page if unauthenticated', function(assert) {
  visit('/login');

  andThen(() => {
    assert.equal(currentURL(), '/login');
  });
});

test('visiting /login redirects to /protected page if authenticated', function(assert) {
  visit('/login');
  authenticateSession(this.application);

  andThen(() => {
    assert.equal(currentURL(), '/protected');
  });
});
