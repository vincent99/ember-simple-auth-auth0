import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const {
  Route,
  Logger,
} = Ember;

export default Route.extend(AuthenticatedRouteMixin, {
  model() {
    return this.store.findAll('post').catch((err) => {
      Logger.error(err);
    });
  }
});
