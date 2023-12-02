import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../shared-modules/services/auth.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class MarketService {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  async save_post(post: any) {
    const token = await this.auth.getToken();

    return await this.http
      .post(environment.api_gateway + 'market', post, {
        headers: new HttpHeaders({
          Authorization: token,
        }),
      })
      .toPromise();
  }

  async update_post(post: any) {
    const token = await this.auth.getToken();

    return await this.http
      .post(environment.api_gateway + 'market/' + post.id, post, {
        headers: new HttpHeaders({
          Authorization: token,
        }),
      })
      .toPromise();
  }

  fetch_posts(params: any) {
    return this.http.get(environment.api_gateway + 'market', {
      params,
    });
  }

  async fetch_post(postId: any) {
    const token = await this.auth.getToken();

    return await this.http
      .get(environment.api_gateway + 'market/' + postId, {
        headers: new HttpHeaders({
          Authorization: token,
        }),
      })
      .toPromise();
  }

  search_posts(params: any) {
    return this.http.get(environment.api_gateway + 'market/search', {
      params,
    });
  }

  async report_post(postId: any, report: any) {
    const token = await this.auth.getToken();

    return await this.http
      .post(environment.api_gateway + 'market/' + postId + '/report', report, {
        headers: new HttpHeaders({
          Authorization: token,
        }),
      })
      .toPromise();
  }
}
