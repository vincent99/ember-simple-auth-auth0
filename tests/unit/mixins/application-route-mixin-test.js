import Ember from 'ember';
import ApplicationRouteMixinMixin from 'ember-simple-auth-auth0/mixins/application-route-mixin';
import getOwner from 'ember-getowner-polyfill';

import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('mixin:application-route-mixin', 'Unit | Mixin | application route mixin', {
  needs: ['service:session', 'service:auth0'],

  subject() {
    let ApplicationRouteMixinObject = Ember.Object.extend(ApplicationRouteMixinMixin, {
      _subscribeToSessionEvents() {}
    });

    this.register('test-container:application-route-mixin-object', ApplicationRouteMixinObject);
    return getOwner(this).lookup('test-container:application-route-mixin-object');
  }
});

test('it works', function(assert) {
  let subject = this.subject();
  assert.ok(subject);
});
