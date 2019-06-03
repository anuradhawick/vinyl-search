import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import Amplify, { Auth, Hub } from 'aws-amplify';
import { environment } from '../../environments/environment';

Amplify.configure(environment.aws_config);
Auth.configure({oauth: environment.oauth});

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
