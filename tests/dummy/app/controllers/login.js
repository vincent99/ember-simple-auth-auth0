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
    loginPasswordless(method, connection) {
      const lockOptions = {
        passwordlessMethod: method,
        allowedConnections: [connection],
        autoclose: true,
      };

      get(this, 'session').authenticate('authenticator:auth0-lock-passwordless', lockOptions, () => {
        Logger.info('Passwordless sent');
      });
    }
  }
});
