import { Component } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { AngularFireFunctions } from '@angular/fire/functions';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'viny-site';

  constructor(public auth: AuthService, private fns: AngularFireFunctions) {
    if (!environment.production) {
      fns.functions.useFunctionsEmulator('http://localhost:5001');
    }
  }

  login() {
    this.auth.login();
  }

  logout() {
    this.auth.logout();
  }
}
