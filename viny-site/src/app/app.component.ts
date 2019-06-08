import { Component } from '@angular/core';
import { AuthService } from './shared-modules/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'viny-site';

  constructor(public auth: AuthService) {

  }
}
