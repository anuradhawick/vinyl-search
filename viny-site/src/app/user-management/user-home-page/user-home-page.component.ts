import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-home-page',
  templateUrl: './user-home-page.component.html',
  styleUrls: ['./user-home-page.component.css']
})
export class UserHomePageComponent implements OnInit {
  public user = null;

  constructor(private userService: UserService) {
  }

  ngOnInit() {
    this.userService.get_profile().then(user => {
      this.user = user;
    });
  }

}
