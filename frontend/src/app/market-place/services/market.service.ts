import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../shared/services/auth.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class MarketService {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  private readonly publicBase = environment.api_gateway + 'public/market';
  private readonly protectedBase = environment.api_gateway + 'market';

  async save_post(post: any) {
    const token = await this.auth.getToken();

    return await this.http
      .post(this.protectedBase, post, {
        headers: new HttpHeaders({
          Authorization: token,
        }),
      })
      .toPromise();
  }

  async update_post(post: any) {
    const token = await this.auth.getToken();

    return await this.http
      .post(`${this.protectedBase}/${post.id}`, post, {
        headers: new HttpHeaders({
          Authorization: token,
        }),
      })
      .toPromise();
  }

  fetch_posts(params: any) {
    return this.http.get(this.publicBase, {
      params,
    });
  }

  async fetch_post(postId: any) {
    return await this.http.get(`${this.publicBase}/${postId}`).toPromise();
  }

  search_posts(params: any) {
    return this.http.get(`${this.publicBase}/search`, {
      params,
    });
  }

  async report_post(postId: any, report: any) {
    const token = await this.auth.getToken();

    return await this.http
      .post(`${this.protectedBase}/${postId}/report`, report, {
        headers: new HttpHeaders({
          Authorization: token,
        }),
      })
      .toPromise();
  }
}
