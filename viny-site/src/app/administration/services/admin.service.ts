import { Injectable } from '@angular/core';
import { AuthService } from '../../shared-modules/services/auth.service';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class AdminService {

  constructor(private auth: AuthService, private http: HttpClient) {
  }

  async get_admins() {
    const token = await this.auth.getToken();

    return await this.http.get(environment.api_gateway + 'admin/admin-users', {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }

  async remove_admin(uid) {
    const token = await this.auth.getToken();

    return await this.http.delete(environment.api_gateway + 'admin/admin-users/' + uid, {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }

  async create_admin(email) {
    const token = await this.auth.getToken();

    return await this.http.post(environment.api_gateway + 'admin/admin-users/' + email, {}, {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }

  async fetch_records(params) {
    const token = await this.auth.getToken();

    return await this.http.get(environment.api_gateway + 'admin/records', {
      headers: new HttpHeaders({
        'Authorization': token
      }),
      params
    }).toPromise();
  }

  async delete_record(recordId) {
    const token = await this.auth.getToken();

    return await this.http.delete(environment.api_gateway + 'admin/records/' + recordId, {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }

  async fetch_forum(params) {
    const token = await this.auth.getToken();

    return await this.http.get(environment.api_gateway + 'admin/forum', {
      headers: new HttpHeaders({
        'Authorization': token
      }),
      params
    }).toPromise();
  }

  async delete_forum(postId) {
    const token = await this.auth.getToken();

    return await this.http.delete(environment.api_gateway + 'admin/forum/' + postId, {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }

  async get_market_post(postId) {
    const token = await this.auth.getToken();

    return await this.http.get(environment.api_gateway + 'admin/market/' + postId, {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }

  async update_market_post(post) {
    const token = await this.auth.getToken();

    return await this.http.post(environment.api_gateway + 'admin/market/' + post.id, post, {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }

  async fetch_reports(params) {
    const token = await this.auth.getToken();

    return await this.http.get(environment.api_gateway + 'admin/reports', {
      headers: new HttpHeaders({
        'Authorization': token
      }),
      params
    }).toPromise();
  }

  async resolve_report(reportId) {
    const token = await this.auth.getToken();

    return await this.http.post(environment.api_gateway + 'admin/reports/' + reportId, {resolved: true}, {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }
}
