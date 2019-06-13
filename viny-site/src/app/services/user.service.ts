import { Injectable } from '@angular/core';
import { AuthService } from '../shared-modules/auth/auth.service';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private auth: AuthService, private http: HttpClient) {
  }

  async get_profile() {
    const token = await this.auth.getToken();

    return await this.http.get(environment.api_gateway + 'users/', {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }

  async get_records() {
    const token = await this.auth.getToken();

    return await this.http.get(environment.api_gateway + 'users/records', {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }

  async get_forum_posts() {
    const token = await this.auth.getToken();

    return await this.http.get(environment.api_gateway + 'users/forum', {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }
}
