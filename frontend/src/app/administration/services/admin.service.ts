import { Injectable } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { from, switchMap } from 'rxjs';

@Injectable()
export class AdminService {
  constructor(
    private auth: AuthService,
    private http: HttpClient,
  ) {}

  get_admins() {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http.get(environment.api_gateway + 'admin/admin-users', {
          headers: new HttpHeaders({
            Authorization: token,
          }),
        }),
      ),
    );
  }

  remove_admin(uid: string) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http.delete(environment.api_gateway + 'admin/admin-users/' + uid, {
          headers: new HttpHeaders({
            Authorization: token,
          }),
        }),
      ),
    );
  }

  create_admin(email: string) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http.post(
          environment.api_gateway + 'admin/admin-users/' + email,
          {},
          {
            headers: new HttpHeaders({
              Authorization: token,
            }),
          },
        ),
      ),
    );
  }

  fetch_records(params: any) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http.get(environment.api_gateway + 'admin/records', {
          headers: new HttpHeaders({
            Authorization: token,
          }),
          params,
        }),
      ),
    );
  }

  delete_record(recordId: string) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http.delete(
          environment.api_gateway + 'admin/records/' + recordId,
          {
            headers: new HttpHeaders({
              Authorization: token,
            }),
          },
        ),
      ),
    );
  }

  fetch_forum(params: any) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http.get(environment.api_gateway + 'admin/forum', {
          headers: new HttpHeaders({
            Authorization: token,
          }),
          params,
        }),
      ),
    );
  }

  delete_forum(postId: string) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http.delete(environment.api_gateway + 'admin/forum/' + postId, {
          headers: new HttpHeaders({
            Authorization: token,
          }),
        }),
      ),
    );
  }

  get_market_post(postId: string) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http.get(environment.api_gateway + 'admin/market/' + postId, {
          headers: new HttpHeaders({
            Authorization: token,
          }),
        }),
      ),
    );
  }

  update_market_post(post: any) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http.post(
          environment.api_gateway + 'admin/market/' + post.id,
          post,
          {
            headers: new HttpHeaders({
              Authorization: token,
            }),
          },
        ),
      ),
    );
  }

  fetch_reports(params: any) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http.get(environment.api_gateway + 'admin/reports', {
          headers: new HttpHeaders({
            Authorization: token,
          }),
          params,
        }),
      ),
    );
  }

  resolve_report(reportId: string) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http.post(
          environment.api_gateway + 'admin/reports/' + reportId,
          { resolved: true },
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
