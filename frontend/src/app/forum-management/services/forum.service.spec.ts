import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { ForumService } from './forum.service';
import { AuthService } from '../../shared-modules/services/auth.service';
import { environment } from '../../../environments/environment';

describe('ForumService', () => {
  let service: ForumService;
  let http: HttpTestingController;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['getToken']);
    auth.getToken.and.resolveTo('token-123');

    TestBed.configureTestingModule({
      providers: [
        ForumService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
      ],
    });

    service = TestBed.inject(ForumService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('searches posts through the public forum search endpoint', async () => {
    const response = firstValueFrom(service.search_posts({ query: 'needle' }));

    const req = http.expectOne(
      (request) =>
        request.url === `${environment.api_gateway}public/forum/search`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('query')).toBe('needle');

    req.flush({ success: true, posts: [] });

    expect(await response).toEqual(
      jasmine.objectContaining({ success: true, posts: [] }),
    );
  });

  it('creates posts through the protected forum endpoint', async () => {
    const response = service.new_post({ postTitle: 'Hello' });
    await Promise.resolve();

    const req = http.expectOne(
      (request) => request.url === `${environment.api_gateway}forum`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('token-123');

    req.flush({ success: true, postId: 'post-1' });

    expect(await response).toEqual(
      jasmine.objectContaining({ success: true, postId: 'post-1' }),
    );
  });
});
