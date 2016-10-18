import Ember from 'ember';
import ApplicationRouteMixinMixin from 'ember-simple-auth-auth0/mixins/application-route-mixin';
import {
  module,
  test
} from '../../helpers/qunit';

module('Unit | Mixin | application route mixin');

// Replace this with your real tests.
test('it works', function(assert) {
  let ApplicationRouteMixinObject = Ember.Object.extend(ApplicationRouteMixinMixin, {
    _subscribeToSessionEvents() {}
  });
  let subject = ApplicationRouteMixinObject.create({ container: this.container });
  assert.ok(subject);
});
