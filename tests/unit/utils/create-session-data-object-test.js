import Ember from 'ember';
import createSessionDataObject from 'dummy/utils/create-session-data-object';
import { module, test } from 'qunit';

const assign = Ember.assign || Ember.merge;

module('Unit | Utility | create session data object');

test('it camelCases all the object keys', function(assert) {
  let profile = {
    ['my-key']: 'foo'
  };

  let result = createSessionDataObject(profile);
  assert.ok(result.myKey);
  assert.equal(result.myKey, profile.myKey);
});

test('it merges the profile and token info', function(assert) {
  let profile = {
    myKey: 'foo'
  };

  let tokenInfo = {
    jwt: 'aaa.bbbb.ccc'
  };

  let expectedResult = assign(profile, tokenInfo);
  let result = createSessionDataObject(profile, tokenInfo);
  assert.deepEqual(result, expectedResult);
});


