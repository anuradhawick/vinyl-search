import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared-modules/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-home-page',
  templateUrl: './user-home-page.component.html',
  styleUrls: ['./user-home-page.component.css']
})
export class UserHomePageComponent implements OnInit {
  public user: Observable<any>;

  constructor(public auth: AuthService) {
    this.user = auth.user.asObservable();
  }

  ngOnInit() {
  }

}
