import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecordsService {

  constructor(private http: HttpClient, private auth: AuthService) {
  }

  save_record(record) {
    return this.http.post(environment.api_gateway + 'records', record, {
      headers: new HttpHeaders({
        'Authorization': this.auth.token
      })
    });
  }

  update_record(record) {
    return this.http.post(environment.api_gateway + 'records/' + record.id, record, {
      headers: new HttpHeaders({
        'Authorization': this.auth.token
      })
    });
  }

  fetch_records(params) {
    return this.http.get(environment.api_gateway + 'records', {
      params
    });
  }

  fetch_record_history(recordId) {
    return this.http.get(environment.api_gateway + 'records/' + recordId + '/revisions');
  }

  search_records(params) {
    return this.http.get(environment.api_gateway + 'records/search', {
      params
    });
  }

  fetch_record(recordId) {
    return this.http.get(environment.api_gateway + 'records/' + recordId);
  }

  fetch_record_revision(recordId, revisionId) {
    return this.http.get(`${environment.api_gateway}records/${recordId}/revisions/${revisionId}`);
  }
}
