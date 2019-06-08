import { TestBed, async, inject } from '@angular/core/testing';

import { AuthOwnGuard } from './auth-own.guard';

describe('AuthOwnGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthOwnGuard]
    });
  });

  it('should ...', inject([AuthOwnGuard], (guard: AuthOwnGuard) => {
    expect(guard).toBeTruthy();
  }));
});
