import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../shared-modules/services/auth.service';

@Injectable()
export class ForumService {

  constructor(private http: HttpClient, private auth: AuthService) {
  }

  fetch_posts(params: any) {
    return this.http.get(environment.api_gateway + 'forum/', {
      params
    });
  }

  fetch_post(postId: string) {
    return this.http.get(environment.api_gateway + 'forum/' + postId);
  }

  fetch_post_comments(postId: string) {
    return this.http.get(environment.api_gateway + 'forum/' + postId + '/comments');
  }

  search_posts(params: any) {
    return this.http.get(environment.api_gateway + 'forum/', {
      params
    });
  }

  async new_post(post: any) {
    const token = await this.auth.getToken();

    return await this.http.post(environment.api_gateway + 'forum/', post, {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }

  async comment_post(postId: string, comment: any) {
    const token = await this.auth.getToken();

    return await this.http.post(environment.api_gateway + 'forum/' + postId + '/comments', comment, {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }

  async comment_delete(postId: string, commentId: string) {
    const token = await this.auth.getToken();

    return await this.http.delete(environment.api_gateway + 'forum/' + postId + '/comments/' + commentId, {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }

  async update_post(postId: string, post: any) {
    const token = await this.auth.getToken();

    return await this.http.post(environment.api_gateway + 'forum/' + postId, post, {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }

  async delete_post(postId: any) {
    const token = await this.auth.getToken();

    return await this.http.delete(environment.api_gateway + 'forum/' + postId, {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }
}
