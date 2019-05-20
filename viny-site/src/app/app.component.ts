import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { AngularFireFunctions } from '@angular/fire/functions';
import * as _ from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'viny-site';

  constructor(public afAuth: AngularFireAuth, private fns: AngularFireFunctions) {
    this.afAuth.auth.onAuthStateChanged((user) => {
      if (!_.isEmpty(user)) {
        user.getIdToken().then((token) => {
          console.log('Token');
          console.log(token);
          const callable = fns.httpsCallable('register_user');
          const data = callable({});
          data.subscribe(() => {
          }, () => {
            alert('Unable to connect to server');
            this.afAuth.auth.signOut();
          });
        }).catch();
      }
    });
  }

  login() {
    this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
  }

  logout() {
    this.afAuth.auth.signOut();
  }
}
