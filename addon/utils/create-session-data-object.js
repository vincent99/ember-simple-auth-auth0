import Ember from 'ember';
const assign = Ember.assign || Ember.merge;

import now from '../utils/now';

export default function createSessionDataObject(profile, tokenInfo) {
  // assign things one at a time so it's compatible with the Ember.merge fallback
  const sessionData = { issuedAt: now() };
  assign(sessionData, tokenInfo);
  assign(sessionData, { profile });
  return sessionData;
}
