import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { MarketService } from './market.service';
import { AuthService } from '../../shared/services/auth.service';
import { environment } from '../../../environments/environment';

describe('MarketService', () => {
  let service: MarketService;
  let http: HttpTestingController;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['getToken']);
    auth.getToken.and.resolveTo('token-123');

    TestBed.configureTestingModule({
      providers: [
        MarketService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
      ],
    });

    service = TestBed.inject(MarketService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('fetches posts from the public market endpoint', async () => {
    const response = firstValueFrom(service.fetch_posts({ limit: '6' }));

    const req = http.expectOne(
      (request) => request.url === `${environment.api_gateway}public/market`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('limit')).toBe('6');

    req.flush({ success: true, posts: [] });

    expect(await response).toEqual(
      jasmine.objectContaining({ success: true, posts: [] }),
    );
  });

  it('reports posts through the protected market endpoint', async () => {
    const response = service.report_post('post-1', { reason: 'spam' });
    await Promise.resolve();

    const req = http.expectOne(
      (request) =>
        request.url === `${environment.api_gateway}market/post-1/report`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('token-123');

    req.flush({ success: true });

    expect(await response).toEqual(jasmine.objectContaining({ success: true }));
  });
});
