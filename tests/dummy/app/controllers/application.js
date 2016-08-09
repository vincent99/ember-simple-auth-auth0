import Ember from 'ember';

const {
  Controller,
  inject,
  get
} = Ember;

export default Controller.extend({
  session: inject.service(),
  actions: {
    logout() {
      get(this, 'session').invalidate();
    }
  }
});
