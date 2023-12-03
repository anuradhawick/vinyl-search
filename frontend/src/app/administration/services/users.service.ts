import { Injectable } from '@angular/core';
import { Amplify } from 'aws-amplify';
import { from, map, switchMap } from 'rxjs';
import { get } from 'aws-amplify/api';

@Injectable()
export class UsersService {
  constructor() {}

  getUsers(skip = 0, limit = 10) {
    return from(
      get({
        apiName: '[vinyl.lk]',
        path: 'admin/users',
        options: {
          queryParams: {
            skip: skip.toString(),
            limit: limit.toString(),
          },
        },
      }).response,
    ).pipe(switchMap((res) => from(res.body.json())));
  }
}
