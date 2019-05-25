import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { AngularFireFunctions } from '@angular/fire/functions';
import * as _ from 'lodash';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public redirectUrl = null;
  public user = null;
  public isLoggedIn = false;
  private autoLogin;

  constructor(public afAuth: AngularFireAuth, private fns: AngularFireFunctions) {
    this.autoLogin = new Promise((resolve, reject) => {
      this.afAuth.auth.onAuthStateChanged((user) => {
        if (!_.isEmpty(user)) {
          user.getIdToken().then((token) => {
            console.log('Token');
            console.log(token);
            const callable = fns.httpsCallable('register_user');
            const data = callable({});
            data.subscribe((u) => {
              this.user = u;
              this.isLoggedIn = true;
              resolve(true);
            }, () => {
              alert('Unable to connect to server');
              this.afAuth.auth.signOut();
              resolve(false);
            });
          }).catch();
        }
      });
    });
  }

  login() {
    this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
  }

  logout() {
    this.afAuth.auth.signOut();
    this.isLoggedIn = false;
    this.user = null;
    this.autoLogin = false;
  }

  loginAuto() {
    return this.autoLogin;
  }
}
