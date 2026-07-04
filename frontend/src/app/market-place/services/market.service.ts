import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../shared/services/auth.service';
import { environment } from '../../../environments/environment';
import { from, switchMap } from 'rxjs';

@Injectable()
export class MarketService {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  private readonly publicBase = environment.api_gateway + 'public/market';
  private readonly protectedBase = environment.api_gateway + 'market';

  save_post(post: any) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http.post(this.protectedBase, post, {
          headers: new HttpHeaders({
            Authorization: token,
          }),
        }),
      ),
    );
  }

  update_post(post: any) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http.post(`${this.protectedBase}/${post.id}`, post, {
          headers: new HttpHeaders({
            Authorization: token,
          }),
        }),
      ),
    );
  }

  fetch_posts(params: any) {
    return this.http.get(this.publicBase, {
      params,
    });
  }

  fetch_post(postId: any) {
    return this.http.get(`${this.publicBase}/${postId}`);
  }

  search_posts(params: any) {
    return this.http.get(`${this.publicBase}/search`, {
      params,
    });
  }

  report_post(postId: any, report: any) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http.post(`${this.protectedBase}/${postId}/report`, report, {
          headers: new HttpHeaders({
            Authorization: token,
          }),
        }),
      ),
    );
  }
}
