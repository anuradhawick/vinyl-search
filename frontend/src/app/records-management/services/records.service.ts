import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { from, shareReplay, map, switchMap } from 'rxjs';
import { post, get } from 'aws-amplify/api';

@Injectable()
export class RecordsService {
  constructor(
    private http: HttpClient,
  ) {}

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
      .get(environment.api_gateway + 'records', {
        params,
      })
      .pipe(shareReplay(1));
  }

  fetch_record_history(recordId: string) {
    return from(
      get({
        apiName: '[vinyl.lk]',
        path: `records/${recordId}/revisions`,
      }).response,
    ).pipe(
      map((res) => res.body),
      switchMap((body) => from(body.json())),
    );
  }

  search_records(params: any) {
    return this.http
      .get(environment.api_gateway + 'records/search', {
        params,
      })
      .pipe(shareReplay(1));
  }

  fetch_record(recordId: string) {
    return from(
      get({
        apiName: '[vinyl.lk]',
        path: `records/${recordId}`,
      }).response,
    ).pipe(
      map((res) => res.body),
      switchMap((body) => from(body.json())),
    );
  }

  fetch_record_revision(recordId: string, revisionId: string) {
    return from(
      get({
        apiName: '[vinyl.lk]',
        path: `records/${recordId}/revisions/${revisionId}`,
      }).response,
    ).pipe(
      map((res) => res.body),
      switchMap((body) => from(body.json())),
    );
  }
}
