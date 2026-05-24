import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { from, shareReplay, map, switchMap } from 'rxjs';
import { post } from 'aws-amplify/api';

@Injectable()
export class RecordsService {
  constructor(private http: HttpClient) {}

  private readonly publicBase = environment.api_gateway + 'public/records';

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
    return this.http.get(`${this.publicBase}/${recordId}/revisions`);
  }

  search_records(params: any) {
    return this.http
      .get(`${this.publicBase}/search`, {
        params,
      })
      .pipe(shareReplay(1));
  }

  fetch_record(recordId: string) {
    return this.http.get(`${this.publicBase}/${recordId}`);
  }

  fetch_record_revision(recordId: string, revisionId: string) {
    return this.http.get(
      `${this.publicBase}/${recordId}/revisions/${revisionId}`,
    );
  }
}
