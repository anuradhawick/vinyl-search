import { Injectable } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { from, switchMap } from 'rxjs';

@Injectable()
export class MarketService {
  constructor(
    private auth: AuthService,
    private http: HttpClient,
  ) {}

  fetch_posts_by_type(params: any) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http.get(environment.api_gateway + 'admin/market', {
          headers: new HttpHeaders({
            Authorization: token,
          }),
          params,
        }),
      ),
    );
  }

  transit_post(id: string, type: string) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http.post(
          environment.api_gateway + 'admin/market',
          { id, type },
          {
            headers: new HttpHeaders({
              Authorization: token,
            }),
          },
        ),
      ),
    );
  }
}
