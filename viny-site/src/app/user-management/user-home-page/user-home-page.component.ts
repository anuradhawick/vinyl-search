import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared-modules/auth/auth.service';

@Component({
  selector: 'app-user-home-page',
  templateUrl: './user-home-page.component.html',
  styleUrls: ['./user-home-page.component.css']
})
export class UserHomePageComponent implements OnInit {

  constructor(public auth: AuthService) {
  }

  ngOnInit() {
  }

}
