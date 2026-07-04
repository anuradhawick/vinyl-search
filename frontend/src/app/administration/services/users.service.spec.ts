import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { UsersService } from './users.service';
import { AuthService } from '../../shared/services/auth.service';
import { environment } from '../../../environments/environment';

describe('UsersService', () => {
  let service: UsersService;
  let http: HttpTestingController;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['getToken']);
    auth.getToken.and.resolveTo('token-123');

    TestBed.configureTestingModule({
      providers: [
        UsersService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
      ],
    });

    service = TestBed.inject(UsersService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('fetches admin users through the protected endpoint with auth headers', async () => {
    const response = firstValueFrom(service.getUsers(3, 7));
    await Promise.resolve();

    const req = http.expectOne(
      (request) => request.url === `${environment.api_gateway}admin/users`,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('token-123');
    expect(req.request.params.get('skip')).toBe('3');
    expect(req.request.params.get('limit')).toBe('7');

    req.flush({ success: true, users: [] });

    expect(await response).toEqual(
      jasmine.objectContaining({ success: true, users: [] }),
    );
  });
});
