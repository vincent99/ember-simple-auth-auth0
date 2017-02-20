import Ember from 'ember';
import moment from 'moment';

const {
  Controller,
  inject: {
    service,
  },
  computed,
  computed: {
    alias,
  },
  get,
} = Ember;

export default Controller.extend({
  session: service(),
  auth0: service(),
  posts: alias('model'),
  expiresIn: computed('session.data.authenticated', function() {
    const foo = get(this, 'session.data.authenticated.idTokenPayload.exp');
    if (foo) {
      return moment.unix(foo);
    }

    const exp = get(this, 'session.data.authenticated.expiresIn');
    return Date.now() + exp * 1000;
  }),
  actions: {
    logout() {
      get(this, 'session').invalidate();
    },
    logoutOfAuth0() {
      get(this, 'auth0').logout();
    }
  }
});
