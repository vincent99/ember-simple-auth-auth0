import Ember from 'ember';

const {
  Controller,
  inject: {
    service,
  },
  computed: {
    alias,
  },
  get,
  Logger,
} = Ember;

export default Controller.extend({
  session: service(),
  myModel: alias('model'),
  actions: {
    login() {
      get(this, 'session').authenticate('authenticator:auth0-lock');
    },
    loginPasswordless(type) {
      const lockOptions = {
        autoclose: true,
      };

      get(this, 'session').authenticate('authenticator:auth0-lock-passwordless', type, lockOptions, () => {
        Logger.info(`Passwordless ${type} sent`);
      });
    }
  }
});
