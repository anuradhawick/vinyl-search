import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../shared-modules/services/auth.service';

@Injectable()
export class ForumService {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  private readonly publicBase = environment.api_gateway + 'public/forum';
  private readonly protectedBase = environment.api_gateway + 'forum';

  fetch_posts(params: any) {
    return this.http.get(this.publicBase, {
      params,
    });
  }

  fetch_post(postId: string) {
    return this.http.get(`${this.publicBase}/${postId}`);
  }

  fetch_post_comments(postId: string) {
    return this.http.get(`${this.publicBase}/${postId}/comments`);
  }

  search_posts(params: any) {
    return this.http.get(`${this.publicBase}/search`, {
      params,
    });
  }

  async new_post(post: any) {
    const token = await this.auth.getToken();

    return await this.http
      .post(this.protectedBase, post, {
        headers: new HttpHeaders({
          Authorization: token,
        }),
      })
      .toPromise();
  }

  async comment_post(postId: string, comment: any) {
    const token = await this.auth.getToken();

    return await this.http
      .post(`${this.protectedBase}/${postId}/comments`, comment, {
        headers: new HttpHeaders({
          Authorization: token,
        }),
      })
      .toPromise();
  }

  async comment_delete(postId: string, commentId: string) {
    const token = await this.auth.getToken();

    return await this.http
      .delete(`${this.protectedBase}/${postId}/comments/${commentId}`, {
        headers: new HttpHeaders({
          Authorization: token,
        }),
      })
      .toPromise();
  }

  async update_post(postId: string, post: any) {
    const token = await this.auth.getToken();

    return await this.http
      .post(`${this.protectedBase}/${postId}`, post, {
        headers: new HttpHeaders({
          Authorization: token,
        }),
      })
      .toPromise();
  }

  async delete_post(postId: any) {
    const token = await this.auth.getToken();

    return await this.http
      .delete(`${this.protectedBase}/${postId}`, {
        headers: new HttpHeaders({
          Authorization: token,
        }),
      })
      .toPromise();
  }
}
