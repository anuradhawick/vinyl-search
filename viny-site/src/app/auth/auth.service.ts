import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import Amplify, { Auth, Hub } from 'aws-amplify';

Amplify.configure({
  Auth: {
    identityPoolId: 'ap-southeast-1:1f542b99-a4f8-426d-96b7-927306d34010',
    region: 'ap-southeast-1',
    userPoolId: 'ap-southeast-1_Z23imsu3V',
    userPoolWebClientId: '5hi1o4rigdv6cqqf96k7cntqvj',
    mandatorySignIn: false,
  },
  Storage: {
    AWSS3: {
      bucket: 'vinyl-bucket',
      region: 'ap-southeast-1',
    }
  }
});
const oauth = {
  domain: 'vinyl-search.auth.ap-southeast-1.amazoncognito.com',
  scope: ['phone', 'email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
  redirectSignIn: 'http://localhost:4200/',
  redirectSignOut: 'http://localhost:4200/',
  responseType: 'code'
};

Auth.configure({oauth});

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public redirectUrl = null;
  public user = null;
  public isLoggedIn = false;
  private autoLogin;
  public token = null;

  constructor() {

    this.autoLogin = new Promise((resolve, reject) => {
      Auth.currentAuthenticatedUser().then((u) => {
        this.user = u.attributes;
        this.user['uid'] = u.attributes.sub;
        this.isLoggedIn = true;
        this.token = _.get(u, 'signInUserSession.idToken.jwtToken', null);
        console.log(this.token)
        console.log(JSON.parse(u.attributes.identities)[0].providerName)
        resolve(true);

      }).catch((e) => {

      });

      Hub.listen('auth', ({payload: {event, data}}) => {
        switch (event) {
          case 'signIn':
            Auth.currentAuthenticatedUser().then((u) => {
              this.user = u.attributes;
              this.user['uid'] = u.attributes.sub;
              this.isLoggedIn = true;
              this.token = _.get(u, 'signInUserSession.idToken.jwtToken', null);
              resolve(true);
            }).catch((e) => {
            });
            break;
          case 'signOut':
            this.isLoggedIn = false;
            this.user = null;
            this.autoLogin = false;
            resolve(false);
            break;
        }
      });
    });
  }


  loginF() {
    Auth.federatedSignIn({customProvider: 'Facebook'}).then(() => {

    }).catch(e => {
      console.log(e);
    });
  }

  loginG() {

    Auth.federatedSignIn({customProvider: 'Google'}).then(() => {

    }).catch(e => {
      console.log(e);
    });
    //
    // Auth.federatedSignIn().then(() => {
    //
    // }).catch(e => {
    //   console.log(e);
    // });
  }

  logout() {
    Auth.signOut();
  }

  loginAuto() {
    return this.autoLogin;
  }
}
