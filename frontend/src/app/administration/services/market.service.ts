import { Injectable } from '@angular/core';
import { AuthService } from '../../shared-modules/services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class MarketService {

  constructor(private auth: AuthService, private http: HttpClient) { }

  async fetch_posts_by_type(params: any) {
    const token = await this.auth.getToken();

    return await this.http.get(environment.api_gateway + 'admin/market', {
      headers: new HttpHeaders({
        'Authorization': token
      }),
      params
    }).toPromise();
  }

  async transit_post(id: string, type: string) {
    const token = await this.auth.getToken();

    return await this.http.post(environment.api_gateway + 'admin/market', { id, type }, {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }
}
