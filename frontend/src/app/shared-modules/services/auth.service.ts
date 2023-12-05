import { Inject, Injectable, NgZone, afterNextRender } from '@angular/core';
import {
  fetchAuthSession,
  getCurrentUser,
  signInWithRedirect,
  signOut,
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { environment } from '../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ReplaySubject } from 'rxjs';
import * as _ from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { LoginModalComponent } from '../modals/login-modal/login-modal.component';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public redirectUrl = null;
  public user: any = new ReplaySubject<any>(1);
  public isLoggedIn: boolean = false;
  public autoLogin: any;
  private customState: any = '';
  private profileLoaded: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private zone: NgZone,
    private http: HttpClient,
    private router: Router,
    @Inject(MatDialog) private dialog: MatDialog,
  ) {
    route.queryParams.subscribe((params: any) => {
      if (params.error === 'invalid_request' && params.error_description) {
        console.log('INVALID REQUEST', params.error_description);
        if (
          params.error_description === 'PreSignUp failed with error Google. '
        ) {
          this.loginFacebook();
        } else if (
          params.error_description === 'PreSignUp failed with error Facebook. '
        ) {
          this.loginGoogle();
        }
      }
    });

    Hub.listen('auth', ({ payload }) => {
      console.log(payload.event, payload);
      (async () => {
        console.log((await fetchAuthSession()).tokens?.idToken?.toString());
      })();
      switch (payload.event) {
        case 'signedIn':
        case 'signInWithRedirect':
          console.log('Login success');
          getCurrentUser().then((u) => {
            this.processUser(u);
          });
          break;
        case 'signedOut':
          console.log('Logout success');
          this.isLoggedIn = false;
          this.user = null;
          this.autoLogin = false;
          this.profileLoaded = false;

          break;
        case 'customOAuthState':
          this.customState = JSON.parse(decodeURIComponent(payload.data));
          this.zone.run(() => this.router.navigate(this.customState));
          getCurrentUser().then((u) => {
            this.processUser(u);
          });
          break;
        default:
          console.log('Unrecornised');
          break;
      }
    });

    this.autoLogin = new Promise((resolve, reject) => {
      getCurrentUser()
        .then((u) => {
          this.processUser(u);
          resolve(true);
        })
        .catch(() => {
          resolve(false);
        });
    });
  }

  processUser(user: any) {
    if (this.profileLoaded) {
      return;
    }
    this.isLoggedIn = true;

    this.zone.run(async () => {
      this.isLoggedIn = true;
      this.http
        .get(environment.api_gateway + 'users/', {
          headers: new HttpHeaders({
            Authorization: await this.getToken(),
          }),
        })
        .subscribe((user) => {
          this.user.next(user);
          this.profileLoaded = true;
        });
    });
  }

  async getToken() {
    try {
      const session = await fetchAuthSession();
      return session.tokens!.idToken!.toString();
    } catch (e) {
      return 'null';
    }
  }

  setUser(user: any) {
    this.user.next(user);
  }

  loginFacebook() {
    signInWithRedirect({
      provider: 'Facebook',
      customState: this.customState,
    })
      .then(() => {})
      .catch((e: any) => {
        console.log(e);
      });
  }

  loginGoogle() {
    signInWithRedirect({
      provider: 'Google',
      customState: this.customState,
    })
      .then(() => {})
      .catch((e: any) => {
        console.log(e);
      });
  }

  login(customeState: any = null) {
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
    signOut();
  }

  loginAuto() {
    return this.autoLogin;
  }
}
