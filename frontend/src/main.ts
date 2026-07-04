import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

if (environment.production) {
  enableProdMode();
}

Amplify.configure(environment.aws_config, {
  Storage: {
    S3: {
      prefixResolver: async () => '',
    },
  },
  API: {
    REST: {
      headers: async () => {
        try {
          return {
            Authorization: `Bearer ${(
              await fetchAuthSession()
            ).tokens!.idToken!.toString()}`,
          };
        } catch (error) {
          return { Authorization: `Bearer` };
        }
      },
    },
  },
});

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
);
