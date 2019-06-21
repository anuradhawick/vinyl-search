import { Injectable } from '@angular/core';
import { AuthService } from '../../shared-modules/auth/auth.service';
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
}
