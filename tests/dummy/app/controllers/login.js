import Ember from 'ember';

const {
  Controller,
  inject,
  get
} = Ember;

export default Controller.extend({
  session: inject.service(),
  actions: {
    login() {
      const lockOptions = {
        autoclose: true,
        auth: {
          redirect: false,
          params: {
            scope: 'openid'
          }
        }
      };

      get(this, 'session').authenticate('authenticator:auth0-lock', lockOptions);
    },
  }
});
