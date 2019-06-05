import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import Amplify, { Auth, Hub, Logger } from 'aws-amplify';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';

declare const $: any;
declare const window: any;

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

  constructor(private route: ActivatedRoute) {
    route.queryParams.subscribe((params: any) => {
      console.log(params);
      if (params.error === 'invalid_request' && params.error_description) {
        if (params.error_description === 'PreSignUp failed with error Google. ') {
          this.loginFacebook();
        } else if (params.error_description === 'PreSignUp failed with error Facebook. ') {
          this.loginGoogle();
        }
      }
    });


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

      Hub.listen('auth', (data) => {
        console.log(data)
        switch (data.payload.event) {
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


  loginFacebook() {
    Auth.federatedSignIn({customProvider: 'Facebook'}).then(() => {

    }).catch(e => {
      console.log(e);
    });
  }

  loginGoogle() {
    Auth.federatedSignIn({customProvider: 'Google'}).then(() => {

    }).catch(e => {
      console.log(e);
    });
  }

  login() {
    $('#loginModal').modal('show');
  }

  logout() {
    Auth.signOut();
  }

  loginAuto() {
    return this.autoLogin;
  }
}
