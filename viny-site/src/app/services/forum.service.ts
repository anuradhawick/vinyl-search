import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../shared-modules/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ForumService {

  constructor(private http: HttpClient, private auth: AuthService) {
  }

  fetch_posts(params) {
    return this.http.get(environment.api_gateway + 'forum/', {
      params
    });
  }

  fetch_post(postId) {
    return this.http.get(environment.api_gateway + 'forum/' + postId);
  }

  fetch_post_comments(postId) {
    return this.http.get(environment.api_gateway + 'forum/' + postId + '/comments');
  }

  search_posts(params) {
    return this.http.get(environment.api_gateway + 'forum/', {
      params
    });
  }

  async new_post(post) {
    const token = await this.auth.getToken();

    return await this.http.post(environment.api_gateway + 'forum/', post, {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }

  async comment_post(postId, comment) {
    const token = await this.auth.getToken();

    return await this.http.post(environment.api_gateway + 'forum/' + postId + '/comments', comment, {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }

  async comment_delete(postId, commentId) {
    const token = await this.auth.getToken();

    return await this.http.delete(environment.api_gateway + 'forum/' + postId + '/comments/' + commentId, {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }

  async update_post(postId, post) {
    const token = await this.auth.getToken();

    return await this.http.post(environment.api_gateway + 'forum/' + postId, post, {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }

  async delete_post(postId) {
    const token = await this.auth.getToken();

    return await this.http.delete(environment.api_gateway + 'forum/' + postId, {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }
}
