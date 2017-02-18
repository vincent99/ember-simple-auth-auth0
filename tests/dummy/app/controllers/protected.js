import Ember from 'ember';

const {
  Controller,
  inject: {
    service,
  },
  computed: {
    alias,
  },
  get
} = Ember;

export default Controller.extend({
  session: service(),
  myModel: alias('model'),
  actions: {
    logout() {
      get(this, 'session').invalidate();
    }
  }
});
