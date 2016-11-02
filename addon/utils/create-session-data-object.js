import Ember from 'ember';

const {
  assign,
  String: {
    camelize
  }
} = Ember;

export default function createSessionDataObject(profile, tokenInfo) {
  let sessionData = assign(profile, tokenInfo);
  for (let [key, value] of Object.entries(sessionData)) {
    delete sessionData[key];
    sessionData[camelize(key)] = value;
  }

  return sessionData;
}
