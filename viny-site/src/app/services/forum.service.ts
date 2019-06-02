import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';

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

  search_posts(params) {
    return this.http.get(environment.api_gateway + 'forum/', {
      params
    });
  }

  new_post(post) {
    return this.http.post(environment.api_gateway + 'forum/', post, {
      headers: new HttpHeaders({
        'Authorization': this.auth.token
      })
    });
  }

  update_post(postId, post) {
    return this.http.post(environment.api_gateway + 'forum/' + postId, post, {
      headers: new HttpHeaders({
        'Authorization': this.auth.token
      })
    });
  }

  delete_post(postId) {
    return this.http.delete(environment.api_gateway + 'forum/' + postId, {
      headers: new HttpHeaders({
        'Authorization': this.auth.token
      })
    });
  }
}
