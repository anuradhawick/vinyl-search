import { Component } from '@angular/core';
import { AuthService } from './shared-modules/auth/auth.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public _ = _;

  constructor(public auth: AuthService) {

  }
}
