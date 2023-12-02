import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../shared-modules/services/auth.service';
import { environment } from '../../../environments/environment';
import { shareReplay } from 'rxjs';

@Injectable()
export class RecordsService {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  async save_record(record: any) {
    const token = await this.auth.getToken();

    return await this.http
      .post(environment.api_gateway + 'records', record, {
        headers: new HttpHeaders({
          Authorization: token,
        }),
      })
      .toPromise();
  }

  async update_record(record: any) {
    const token = await this.auth.getToken();

    return await this.http
      .post(environment.api_gateway + 'records/' + record.id, record, {
        headers: new HttpHeaders({
          Authorization: token,
        }),
      })
      .toPromise();
  }

  fetch_records(params: any) {
    return this.http
      .get(environment.api_gateway + 'records', {
        params,
      })
      .pipe(shareReplay(1));
  }

  async fetch_record_history(recordId: string) {
    const token = await this.auth.getToken();

    return await this.http
      .get(environment.api_gateway + 'records/' + recordId + '/revisions', {
        headers: new HttpHeaders({
          Authorization: token,
        }),
      })
      .pipe(shareReplay(1))
      .toPromise();
  }

  search_records(params: any) {
    return this.http
      .get(environment.api_gateway + 'records/search', {
        params,
      })
      .pipe(shareReplay(1));
  }

  async fetch_record(recordId: string) {
    const token = await this.auth.getToken();

    return await this.http
      .get(environment.api_gateway + 'records/' + recordId, {
        headers: new HttpHeaders({
          Authorization: token,
        }),
      })
      .pipe(shareReplay(1))
      .toPromise();
  }

  async fetch_record_revision(recordId: string, revisionId: string) {
    const token = await this.auth.getToken();

    return await this.http
      .get(
        `${environment.api_gateway}records/${recordId}/revisions/${revisionId}`,
        {
          headers: new HttpHeaders({
            Authorization: token,
          }),
        },
      )
      .pipe(shareReplay(1))
      .toPromise();
  }
}
