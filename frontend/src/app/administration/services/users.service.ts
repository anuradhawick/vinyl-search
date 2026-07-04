import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { from, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../shared/services/auth.service';

@Injectable()
export class UsersService {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  getUsers(skip = 0, limit = 10) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http.get(environment.api_gateway + 'admin/users', {
          headers: new HttpHeaders({
            Authorization: token,
          }),
          params: {
            skip: skip.toString(),
            limit: limit.toString(),
          },
        }),
      ),
    );
  }
}
