import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { getCurrentUser } from 'aws-amplify/auth';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const auth: AuthService = inject(AuthService);

  try {
    await getCurrentUser();
    return true;
  } catch (error) {
    // console.log(auth);
    auth.login(JSON.stringify([state.url]));
    return false;
  }
};
