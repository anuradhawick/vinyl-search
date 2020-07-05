import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../shared-modules/services/auth.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class RecordsService {

  constructor(private http: HttpClient, private auth: AuthService) {
  }

  async save_record(record) {
    const token = await this.auth.getToken();

    return await this.http.post(environment.api_gateway + 'records', record, {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }

  async update_record(record) {
    const token = await this.auth.getToken();

    return await this.http.post(environment.api_gateway + 'records/' + record.id, record, {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }

  fetch_records(params) {
    return this.http.get(environment.api_gateway + 'records', {
      params
    });
  }

  async fetch_record_history(recordId) {
    const token = await this.auth.getToken();

    return await this.http.get(environment.api_gateway + 'records/' + recordId + '/revisions', {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }

  search_records(params) {
    return this.http.get(environment.api_gateway + 'records/search', {
      params
    });
  }

  async fetch_record(recordId) {
    const token = await this.auth.getToken();

    return await this.http.get(environment.api_gateway + 'records/' + recordId, {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }

  async fetch_record_revision(recordId, revisionId) {
    const token = await this.auth.getToken();

    return await this.http.get(`${environment.api_gateway}records/${recordId}/revisions/${revisionId}`, {
      headers: new HttpHeaders({
        'Authorization': token
      })
    }).toPromise();
  }
}
