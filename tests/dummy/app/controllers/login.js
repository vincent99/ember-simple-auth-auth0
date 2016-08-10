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
      var lockOptions = {
        autoclose: true,
        auth: {
          redirect: false,
          params: {
            scope: 'openid offline_access'
          }
        }
      };

      get(this, 'session').authenticate('authenticator:auth0-lock', lockOptions).then(() => {
        console.log('finished');
      }).catch((err) => {
        console.log(err);
      });
    },
  }
});
