import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { from, map, shareReplay, switchMap } from 'rxjs';
import { post } from 'aws-amplify/api';
import { AuthService } from '../../shared/services/auth.service';

@Injectable()
export class RecordsService {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  private readonly publicBase = environment.api_gateway + 'public/records';
  private readonly protectedBase = environment.api_gateway + 'records';

  save_record(record: any) {
    return from(
      post({
        apiName: '[vinyl.lk]',
        path: 'records',
        options: { body: record },
      }).response,
    ).pipe(
      map((res) => res.body),
      switchMap((body) => from(body.json())),
    );
  }

  update_record(record: any) {
    return from(
      post({
        apiName: '[vinyl.lk]',
        path: `records/${record.id}`,
        options: { body: record },
      }).response,
    ).pipe(
      map((res) => res.body),
      switchMap((body) => from(body.json())),
    );
  }

  fetch_records(params: any) {
    return this.http
      .get(this.publicBase, {
        params,
      })
      .pipe(shareReplay(1));
  }

  fetch_record_history(recordId: string) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http.get(`${this.protectedBase}/${recordId}/revisions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ),
    );
  }

  search_records(params: any) {
    return this.http
      .get(`${this.publicBase}/search`, {
        params,
      })
      .pipe(shareReplay(1));
  }

  fetch_record(recordId: string) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http.get(`${this.protectedBase}/${recordId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ),
    );
  }

  fetch_record_revision(recordId: string, revisionId: string) {
    return from(this.auth.getToken()).pipe(
      switchMap((token) =>
        this.http.get(
          `${this.protectedBase}/${recordId}/revisions/${revisionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      ),
    );
  }
}
