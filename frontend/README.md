# Vinyl.LK

Angular and AWS Lambda project of Vinyl.LK 

## Development server

```
# ui at port 4200
ng serve

# serverless offline
cd lambda
node offline-serverless.js

#OR
cd lambda
npm start

```

## Development SSR

```
npm run serve:ssr
```

## Deployment of Angular

```
npm run build:deploy:prod
```

## Deployment of Backend Lambdas

```
serverless deploy --stage prod --service <SERVICE FOLDER>
```

## Environment Variables Angular


File `./src/environment/environment.prod.ts` or `./src/environment/environment.ts`

```js
export const environment = {
  production: false,
  aws_config: {
    Auth: {
      identityPoolId: '',
      region: '',
      userPoolId: '',
      userPoolWebClientId: '',
      mandatorySignIn: false,
      oauth: {
        domain: '',
        scope: ['phone', 'email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
        redirectSignIn: 'http://localhost:4200/',
        redirectSignOut: 'http://localhost:4200/',
        responseType: 'code',
        code_challenge: null
      },
    },
    Storage: {
      AWSS3: {
        bucket: '',
        region: '',
      }
    }
  },
  api_gateway: ''
};
```

## Environment Variables for Backend Lambdas

These variables are shared with the SSR lambda for Angular app.

```yaml
config:
  service: 
  region: 
  userpool_authorizer_arn: arn:
  user_pool_id: 
env:
  MONGODB_ATLAS_CLUSTER_URI: mongodb://localhost:27017
  BUCKET_NAME: 
  BUCKET_REGION: 

```
