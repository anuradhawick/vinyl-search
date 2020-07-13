import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared-modules/services/auth.service';

@Component({
  selector: 'app-user-home-page',
  templateUrl: './user-home-page.component.html',
  styleUrls: ['./user-home-page.component.css']
})
export class UserHomePageComponent implements OnInit {
  public user = null;

  constructor(public auth: AuthService) {
    this.user = auth.user.asObservable();
  }

  ngOnInit() {
  }

}
