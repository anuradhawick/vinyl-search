# Vinyl Lk Frontend

## Environment

Place in the following locations

* `src/environments/environment.ts`
* `src/environments/environment.prod.ts`

Template is as follows. Create the production version by refering to the production variables. Note that terraform will only deploy the production version as development tasks can be done offline.

```typescript
import { fetchAuthSession } from 'aws-amplify/auth';

export const environment = {
  production: false,
  aws_config: {
    Auth: {
      Cognito: {
        identityPoolId: 'ap-southeast-1:XXXXXX',
        region: 'ap-southeast-1',
        userPoolId: 'ap-southeast-XXXXXX',
        userPoolClientId: 'XXXXXX',
        mandatorySignIn: false,
        loginWith: {
          oauth: {
            domain: 'devauth.vinyl.lk',
            scopes: [
              'phone',
              'email',
              'profile',
              'openid',
              'aws.cognito.signin.user.admin',
            ],
            redirectSignIn: ['http://localhost:4200/'],
            redirectSignOut: ['http://localhost:4200/'],
            responseType: 'code' as any,
          },
        },
      },
    },
    Storage: {
      S3: {
        bucket: 'vinyl-lk-data-bucket-dev-XXXXXX',
        region: 'ap-southeast-1',
      },
    },
    API: {
      REST: {
        '[vinyl.lk]': {
          endpoint: 'https://devapi.vinyl.lk/',
          region: 'ap-southeast-1',
        },
      },
    },
  },
  api_gateway: 'https://devapi.vinyl.lk/',
  cdn_url: 'https://devcdn.vinyl.lk/',
};
```

## Routing Guide

Routes are re-used except for ones that end with `new` and `edit` for obvious reasons. However, when user redirects from a successful `edit` operation, use the following syntax.

```typescript
this.router.navigate(['/forum', this.postId, 'view', { reload: true }]);
```

Re-use strategy will capture this router param (not to be confused with queryParams) and will force a new view rendering. Indeed getting the latest version of the edited entry.