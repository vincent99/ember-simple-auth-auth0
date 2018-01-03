import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth-auth0/mixins/application-route-mixin';

const {
  Route
} = Ember;

export default Route.extend(ApplicationRouteMixin, {
  routeAfterAuthentication: 'protected'
});
