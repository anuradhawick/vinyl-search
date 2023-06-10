import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { shareReplay } from 'rxjs/internal/operators';

@Injectable()
export class UserService {

  constructor(private auth: AuthService, private http: HttpClient) {
  }

  async get_profile() {
    const token = await this.auth.getToken();

    return await this.http.get(environment.api_gateway + 'users/', {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).pipe(shareReplay(1)).toPromise();
  }

  async update_profile(user) {
    const token = await this.auth.getToken();

    return await this.http.post(environment.api_gateway + 'users/', user, {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }

  async get_records(params) {
    const token = await this.auth.getToken();

    return await this.http.get(environment.api_gateway + 'users/records', {
      params,
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).pipe(shareReplay(1)).toPromise();
  }

  async get_forum_posts(params) {
    const token = await this.auth.getToken();

    return await this.http.get(environment.api_gateway + 'users/forum', {
      params,
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).pipe(shareReplay(1)).toPromise();
  }

  async get_market_posts(params) {
    const token = await this.auth.getToken();

    return await this.http.get(environment.api_gateway + 'users/market', {
      params,
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).pipe(shareReplay(1)).toPromise();
  }

  async delete_record(id) {
    const token = await this.auth.getToken();

    return await this.http.delete(environment.api_gateway + 'users/records/' + id, {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }

  async mark_selling_item_sold(id) {
    const token = await this.auth.getToken();

    return await this.http.post(environment.api_gateway + 'users/market/' + id + '/sold', {}, {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }
}
