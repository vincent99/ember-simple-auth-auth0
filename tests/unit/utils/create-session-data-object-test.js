import Ember from 'ember';
import createSessionDataObject from 'dummy/utils/create-session-data-object';
import {
  module,
  test
} from 'qunit';

const assign = Ember.assign || Ember.merge;

module('Unit | Utility | create session data object');

test('it merges the profile and token info', function(assert) {
  assert.expect(1);

  let profile = {
    my_key: 'foo'
  };

  let tokenInfo = {
    idToken: 'aaa.bbbb.ccc'
  };

  let expectedResult = assign({ profile }, tokenInfo);
  let result = createSessionDataObject(profile, tokenInfo);
  assert.deepEqual(result, expectedResult);
});
