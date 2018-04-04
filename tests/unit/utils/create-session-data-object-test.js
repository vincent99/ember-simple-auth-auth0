import Ember from 'ember';
import createSessionDataObject from 'dummy/utils/create-session-data-object';
import {
  module,
  test
} from 'qunit';

import now from 'ember-simple-auth-auth0/utils/now';

const assign = Ember.assign || Ember.merge;

module('Unit | Utility | create session data object');

test('it merges the profile and token info', function(assert) {
  assert.expect(1);

  const issuedAt = now();

  let profile = {
    my_key: 'foo'
  };

  let tokenInfo = {
    idToken: 'aaa.bbbb.ccc'
  };

  let expectedResult = assign({ issuedAt: issuedAt }, { profile }, tokenInfo);
  let result = createSessionDataObject(profile, tokenInfo);
  assert.deepEqual(result, expectedResult);
});

test('it merges the profile and token info, ignoring a previous profile attribute', function(assert) {
  assert.expect(1);

  const issuedAt = now();

  let profile = {
    my_key: 'foo'
  };

  let tokenInfo = {
    idToken: 'aaa.bbbb.ccc',
    profile: { some: 'stuff' }
  };

  let expectedResult = {
    issuedAt: issuedAt,
    idToken: 'aaa.bbbb.ccc',
    profile,
  };

  let result = createSessionDataObject(profile, tokenInfo);
  assert.deepEqual(result, expectedResult);
});

test('it issues a creation timestamp', function(assert) {
  assert.expect(1);

  let profile = {
    my_key: 'foo'
  };

  let tokenInfo = {
    idToken: 'aaa.bbbb.ccc'
  };

  let result = createSessionDataObject(profile, tokenInfo);
  assert.ok(result.issuedAt);
});
