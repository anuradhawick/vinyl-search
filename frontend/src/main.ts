import { enableProdMode } from '@angular/core';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import { platformBrowser } from '@angular/platform-browser';

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

platformBrowser()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
