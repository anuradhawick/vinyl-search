import { Injectable, NgZone } from '@angular/core';
import { Auth, CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import { Hub } from '@aws-amplify/core';
import { environment } from '../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ReplaySubject } from 'rxjs';
import * as _ from 'lodash';
import { MatDialog } from '@angular/material';
import { LoginModalComponent } from '../modals/login-modal/login-modal.component';

declare const $: any;
declare const window: any;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public redirectUrl = null;
  public user = new ReplaySubject<any>(1);
  public isLoggedIn = false;
  private autoLogin;
  private customState: any = '';
  private profileLoaded = false;

  constructor(private route: ActivatedRoute,
              private zone: NgZone,
              private http: HttpClient,
              private router: Router,
              private dialog: MatDialog) {
    route.queryParams.subscribe((params: any) => {
      if (params.error === 'invalid_request' && params.error_description) {
        console.log('INVALID REQUEST', params.error_description);
        if (params.error_description === 'PreSignUp failed with error Google. ') {
          this.loginFacebook();
        } else if (params.error_description === 'PreSignUp failed with error Facebook. ') {
          this.loginGoogle();
        }
      }
    });

    Hub.listen('auth', ({payload: {event, data}}) => {
      console.log(event, data);
      switch (event) {
        case 'signIn':
          console.log('Login success');
          Auth.currentAuthenticatedUser().then((u) => {
            this.processUser(u);
          });
          break;
        case 'signOut':
          console.log('Logout success');
          this.isLoggedIn = false;
          this.user = null;
          this.autoLogin = false;

          break;
        case 'customOAuthState':
          this.isLoggedIn = true;
          this.customState = JSON.parse(decodeURIComponent(data));
          this.zone.run(() => this.router.navigate(this.customState));
          Auth.currentAuthenticatedUser().then((u) => {
            this.processUser(u);
          });
          break;
        case 'signIn_failure':
          break;
        case 'cognitoHostedUI_failure':
          break;
        case 'customState_failure':
          break;
      }
    });

    this.autoLogin = new Promise((resolve, reject) => {
      Auth.currentAuthenticatedUser().then((u) => {
        this.processUser(u);
        resolve(true);
      }).catch((e) => {
        resolve(false);
      });
    });
  }

  processUser(u) {
    // console.log(u);
    // console.log(u.signInUserSession.idToken.jwtToken);
    if (this.profileLoaded) {
      return;
    }
    this.zone.run(async () => {
      this.isLoggedIn = true;
      this.user.next(await this.http.get(environment.api_gateway + 'users/', {
        headers: new HttpHeaders({
          'Authorization': await this.getToken()
        })
      }).toPromise());
      this.profileLoaded = true;
    });
  }

  async getToken() {
    try {
      const session: any = await Auth.currentSession();
      return session.idToken.jwtToken;
    } catch (e) {
      return null;
    }
  }

  setUser(user) {
    this.user.next(user);
  }

  loginFacebook() {
    Auth.federatedSignIn({
      provider: CognitoHostedUIIdentityProvider.Facebook,
      customState: this.customState
    }).then(() => {

    }).catch(e => {
      console.log(e);
    });
  }

  loginGoogle() {
    Auth.federatedSignIn({provider: CognitoHostedUIIdentityProvider.Google, customState: this.customState}).then(() => {

    }).catch(e => {
      console.log(e);
    });
  }

  login(customeState = null) {
    if (_.isEmpty(customeState)) {
      this.customState = JSON.stringify([this.router.routerState.snapshot.url]);
    } else {
      this.customState = customeState;
    }

    const dialog = this.dialog.open(LoginModalComponent);

    dialog.afterClosed().subscribe((result) => {
      switch (result) {
        case 'Facebook':
          this.loginFacebook();
          break;
        case 'Google':
          this.loginGoogle();
          break;
        default:
          break;
      }
    });
  }

  logout() {
    this.redirectUrl = null;
    this.user = null;
    this.isLoggedIn = false;
    this.autoLogin = null;
    Auth.signOut();
  }

  loginAuto() {
    return this.autoLogin;
  }
}
