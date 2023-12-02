import { Component, OnInit } from '@angular/core';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.scss',
})
export class ManageUsersComponent implements OnInit {
  constructor(private us: UsersService) {}

  ngOnInit(): void {
    // this.us.getUsers().subscribe((u)=> console.log(u))
  }
}
