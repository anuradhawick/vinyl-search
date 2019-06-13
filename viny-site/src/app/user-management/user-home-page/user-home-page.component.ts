import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared-modules/auth/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-home-page',
  templateUrl: './user-home-page.component.html',
  styleUrls: ['./user-home-page.component.css']
})
export class UserHomePageComponent implements OnInit {
  public user = null;

  constructor(public auth: AuthService, private userService: UserService) {
  }

  ngOnInit() {
    this.userService.get_profile().then(user => {
      this.user = user;
    });
  }

}
