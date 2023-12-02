import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';

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

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
