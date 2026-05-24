import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { RecordsService } from './records.service';
import { environment } from '../../../environments/environment';

describe('RecordsService', () => {
  let service: RecordsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RecordsService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(RecordsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('fetches record lists from the public endpoint', async () => {
    const response = firstValueFrom(service.fetch_records({ limit: '5' }));

    const req = http.expectOne(
      (request) => request.url === `${environment.api_gateway}public/records`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('limit')).toBe('5');

    req.flush({ success: true, records: [] });

    expect(await response).toEqual(
      jasmine.objectContaining({ success: true, records: [] }),
    );
  });

  it('fetches record revisions from the public endpoint', async () => {
    const response = firstValueFrom(
      service.fetch_record_revision('record-1', 'revision-1'),
    );

    const req = http.expectOne(
      `${environment.api_gateway}public/records/record-1/revisions/revision-1`,
    );
    expect(req.request.method).toBe('GET');

    req.flush({ success: true, record: { id: 'record-1' } });

    expect(await response).toEqual(
      jasmine.objectContaining({ success: true, record: { id: 'record-1' } }),
    );
  });
});
