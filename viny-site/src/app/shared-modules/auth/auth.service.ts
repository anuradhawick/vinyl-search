import { Injectable, NgZone } from '@angular/core';
import * as _ from 'lodash';
import Amplify, { Auth, Hub } from 'aws-amplify';
import { environment } from '../../../environments/environment';
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

  constructor(private route: ActivatedRoute, private zone: NgZone) {
    route.queryParams.subscribe((params: any) => {
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
        this.processUser(u);
        console.log(JSON.parse(u.attributes.identities)[0].providerName);
        resolve(true);

      }).catch((e) => {

      });

      Hub.listen('auth', (data) => {
        switch (data.payload.event) {
          case 'signIn':
            console.log('Login success');
            Auth.currentAuthenticatedUser().then((u) => {
              this.processUser(u);
              resolve(true);
            }).catch((e) => {
            });
            break;
          case 'signOut':
            console.log('Logout success');
            this.isLoggedIn = false;
            this.user = null;
            this.autoLogin = false;
            resolve(false);
            break;
        }
      });
    });
  }

  processUser(u) {
    this.zone.run(() => {
      this.user = u.attributes;
      this.user['uid'] = u.attributes.sub;
      this.isLoggedIn = true;
    });
  }

  async getToken() {
    const session: any = await Auth.currentSession();
    return session.idToken.jwtToken || null;
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
