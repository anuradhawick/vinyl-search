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

  fetch_records(params) {
    return this.http.get(environment.api_gateway + 'records', {
      params
    });
  }

  search_records(params) {
    return this.http.get(environment.api_gateway + 'records/search', {
      params
    });
  }

  fetch_record(recordId) {
    return this.http.get(environment.api_gateway + 'records/' + recordId);
  }
}
