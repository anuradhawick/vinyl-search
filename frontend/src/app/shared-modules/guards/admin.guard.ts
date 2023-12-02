import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import * as _ from 'lodash';

export const adminGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);

  try {
    const session = await fetchAuthSession();
    const groups: string[] = _.get(
      session.tokens?.idToken?.payload,
      'cognito:groups',
      [],
    ) as [];
    return groups.includes('Admin');
  } catch (error) {
    return router.parseUrl('/');
  }
};
