import { Injectable } from '@angular/core';
import {  Amplify } from 'aws-amplify';
import { from } from 'rxjs';
// import { get } from 'aws-amplify/api';

@Injectable()
export class UsersService {
  constructor() {}

  getUsers(skip = 0, limit = 10) {
    // Amplify.getConfig
    // return from(API.get('[vinyl.lk]', '/admin/users', { skip, limit }));
  }
}
