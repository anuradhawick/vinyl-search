import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../shared-modules/auth/auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MarketService {

  constructor(private http: HttpClient, private auth: AuthService) { }

  async save_post(post) {
    const token = await this.auth.getToken();

    return await this.http.post(environment.api_gateway + 'market', post, {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }

  async update_post(post) {
    const token = await this.auth.getToken();

    return await this.http.post(environment.api_gateway + 'market/' + post.id, post, {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }

  fetch_posts(params) {
    return this.http.get(environment.api_gateway + 'market', {
      params
    });
  }

  fetch_post(postId) {
    return this.http.get(environment.api_gateway + 'market/' + postId);
  }

  search_posts(params) {
    return this.http.get(environment.api_gateway + 'market/search', {
      params
    });
  }
}
