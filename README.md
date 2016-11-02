# ember-simple-auth-auth0

[![Build Status](https://travis-ci.org/seawatts/ember-simple-auth-auth0.svg?branch=master)](https://travis-ci.org/seawatts/ember-simple-auth-auth0)
[![Ember Observer Score](https://emberobserver.com/badges/ember-simple-auth-auth0.svg)](https://emberobserver.com/addons/ember-simple-auth-auth0)
[![npm version](https://badge.fury.io/js/ember-simple-auth-auth0.svg)](https://badge.fury.io/js/ember-simple-auth-auth0)

### An ember-cli addon for using [Auth0](https://auth0.com/) with [Ember Simple Auth](https://github.com/simplabs/ember-simple-auth).

Auth0's [lock](https://github.com/auth0/lock) widget, is a nice way to get a fully functional signup and login workflow into your app.

## What does it do?

* Wires up Auth0's Lock.js to work with ember simple auth.
* Lets you work with ember simple auth just like you normally do!

### Auth0

If you don't already have an account, go signup at for free: [Auth0](https://auth0.com/)

1. Create a new app through your dashboard.
1. Add `http://localhost:4200` to your Allowed Callback URLs through your dashboard
1. Done!

## Installation

**Install this addon with ember-cli** `ember install ember-simple-auth-auth0`


## Global Configuration

**In your `config/environment.js` file, you must provide the following properties**

1. (REQUIRED) - _clientID_ - Grab from your[Auth0 Dashboard](https://manage.auth0.com/#/clients)
2. (REQUIRED) - _domain_ - Grab from your [Auth0 Dashboard](https://manage.auth0.com/#/clients)
3. (OPTIONAL) - _logoutURL_ - This can be overridden if you have a different logout callback than the login page. This will be used as the redirectURL passed to auth0 upon logging out.

```js
// config/environment.js
module.exports = function(environment) {
  let ENV = {
    ['ember-simple-auth']: {
      authenticationRoute: 'login', 
      auth0: {
        clientID: '1234',
        domain: 'my-company.auth0.com',
        logoutURL: '/logout',
    },
  };
  
  return ENV;
};
```

### Suggested security config

Ember uses a [content security policy](http://www.html5rocks.com/en/tutorials/security/content-security-policy/) to manage which resources are allowed to be run on your pages.

```js
// config/environment.js

ENV['contentSecurityPolicy'] = {
    'font-src': "'self' data: https://*.auth0.com",
    'style-src': "'self' 'unsafe-inline'",
    'script-src': "'self' 'unsafe-eval' https://*.auth0.com",
    'img-src': '*.gravatar.com *.wp.com data:',
    'connect-src': "'self' http://localhost:* https://your-app-domain.auth0.com"
  };

```

## Data object on the session

The following is what the session object looks like after the user has been authenticated.

__Note: all keys coming back from auth0 are transformed to camelcase for consistency__

```json
{
  "authenticated": {
    "authenticator": "authenticator:auth0-lock",
    "email": "foo@bar.com",
    "appMetadata": {
    },
    "userMetadata": {
    },
    "emailVerified": true,
    "clientID": "YwDY9D433seMHCred7j0BESjlnwF7ry8",
    "updatedAt": "2016-11-02T20:25:41.892Z",
    "userId": "auth0|0ba14c34-2247-40f9-b918-292a4bab8995",
    "identities": [
      {
        "user_id": "0ba04c34-2447-40f9-b918-292a4bab8995",
        "provider": "auth0",
        "connection": "DB",
        "isSocial": false
      }
    ],
    "createdAt": "2016-03-29T18:47:22.112Z",
    "globalClientId": "IW2jtMb1aRIz0pOwPdN2Ciuh2uIdzfyQ",
    "accessToken": "AFitss4o7L2xb41p",
    "idToken": "aaaa.bbbbb.cccc",
    "idTokenPayload": {
      "iss": "https://domain.auth0.com/",
      "sub": "auth0|0ba04c32-2247-40f9-b918-292a4bab8995",
      "aud": "YwDY9D433veMH2red7j0BESjlnwF7ry8",
      "exp": 1478618342,
      "iat": 1478118342
    }
  }
}

```

__You can use this in your templates that have the session service injected.__

```html 
My logged in user email is {{session.data.authenticated.email}}!
```

## Example
__Here is an example application route:__

```js
// app/routes/application.js

import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth-auth0/mixins/application-route-mixin';

const {
  Route,
  get
} = Ember;

export default Route.extend(ApplicationRouteMixin, {
  beforeSessionExpired() {
    // Do async logic
    // Notify the user that they are about to be logged out.
    
    return RSVP.resolve();
  },
  actions: {
    login () {
      // Check out the docs for all the options:
      // https://auth0.com/docs/libraries/lock/customization
      const lockOptions = {
        authParams: {
          scope: 'openid'
        }
      };
      
      get(this, 'session').authenticate('authenticator:my-cool-authenticator', lockOptions);
    },

    logout () {
      get(this, 'session').invalidate();
    }
  }
});

```

__Add the session service to your application controller:__

```js
// app/controllers/application.js

import Ember from 'ember';

const {
  Controller,
  inject: {
    service
  }
} = Ember;

export default Controller.extend({
  session: service()
});
```

```html
// app/templates/application.hbs

{{#if session.isAuthenticated}}
  <a {{ action 'logout' }}>Logout</a>
{{else}}
  <a {{ action 'login' }}>Login</a>
{{/if}}
```

# Contributing

## Cloning

* `git clone` this repository
* `npm install`
* `bower install`

## Running

* Set the environment variable AUTH0_CLIENT_ID_ID={Your account id}
* Set the environment variable AUTH0_DOMAIN={Your account domain}
* Grab from your those from the [Auth0 Dashboard](https://manage.auth0.com/#/clients)
* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Running Tests

* `npm test` (Runs `ember try:testall` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://ember-cli.com/](http://ember-cli.com/).
