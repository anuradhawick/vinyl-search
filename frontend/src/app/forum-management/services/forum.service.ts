import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../shared/services/auth.service';
import { from, switchMap } from 'rxjs';

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

  new_post(post: any) {
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

  comment_post(postId: string, comment: any) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http.post(`${this.protectedBase}/${postId}/comments`, comment, {
          headers: new HttpHeaders({
            Authorization: token,
          }),
        }),
      ),
    );
  }

  comment_delete(postId: string, commentId: string) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http.delete(
          `${this.protectedBase}/${postId}/comments/${commentId}`,
          {
            headers: new HttpHeaders({
              Authorization: token,
            }),
          },
        ),
      ),
    );
  }

  update_post(postId: string, post: any) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http.post(`${this.protectedBase}/${postId}`, post, {
          headers: new HttpHeaders({
            Authorization: token,
          }),
        }),
      ),
    );
  }

  delete_post(postId: any) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http.delete(`${this.protectedBase}/${postId}`, {
          headers: new HttpHeaders({
            Authorization: token,
          }),
        }),
      ),
    );
  }
}
