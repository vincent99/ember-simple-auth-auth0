import Ember from 'ember';
const assign = Ember.assign || Ember.merge;

import now from '../utils/now';

export default function createSessionDataObject(profile, tokenInfo) {
  return assign({ issuedAt: now() }, tokenInfo, { profile });
}
