import Ember from 'ember';

const {
  String: {
    camelize
  }
} = Ember;

const assign = Ember.assign || Ember.merge;

export default function createSessionDataObject(profile, tokenInfo) {
  let sessionData = assign(profile, tokenInfo);
  camelcaseKeys(sessionData);

  return sessionData;
}

function camelcaseKeys(sessionData) {
  for (let [key, value] of Object.entries(sessionData)) {
    delete sessionData[key];
    sessionData[camelize(key)] = value;
  }
}
