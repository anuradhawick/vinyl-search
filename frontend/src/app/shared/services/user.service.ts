import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { from, shareReplay, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private auth: AuthService,
    private http: HttpClient,
  ) {}

  get_profile() {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http
          .get(environment.api_gateway + 'users', {
            headers: new HttpHeaders({
              Authorization: token,
            }),
          })
          .pipe(shareReplay(1)),
      ),
    );
  }

  update_profile(user: any) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http.post(environment.api_gateway + 'users', user, {
          headers: new HttpHeaders({
            Authorization: token,
          }),
        }),
      ),
    );
  }

  get_records(params: any) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http
          .get(environment.api_gateway + 'users/records', {
            params,
            headers: new HttpHeaders({
              Authorization: token,
            }),
          })
          .pipe(shareReplay(1)),
      ),
    );
  }

  get_forum_posts(params: any) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http
          .get(environment.api_gateway + 'users/forum', {
            params,
            headers: new HttpHeaders({
              Authorization: token,
            }),
          })
          .pipe(shareReplay(1)),
      ),
    );
  }

  get_market_posts(params: any) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http
          .get(environment.api_gateway + 'users/market', {
            params,
            headers: new HttpHeaders({
              Authorization: token,
            }),
          })
          .pipe(shareReplay(1)),
      ),
    );
  }

  delete_record(id: any) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http.delete(environment.api_gateway + 'users/records/' + id, {
          headers: new HttpHeaders({
            Authorization: token,
          }),
        }),
      ),
    );
  }

  delete_forum_post(id: any) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http.delete(environment.api_gateway + 'users/forum/' + id, {
          headers: new HttpHeaders({
            Authorization: token,
          }),
        }),
      ),
    );
  }

  mark_selling_item_sold(id: any) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http.post(
          environment.api_gateway + 'users/market/' + id + '/sold',
          {},
          {
            headers: new HttpHeaders({
              Authorization: token,
            }),
          },
        ),
      ),
    );
  }
}
