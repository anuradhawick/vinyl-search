import { Amplify } from 'aws-amplify';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/ssr';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

Amplify.configure(environment.aws_config);

const bootstrap = () =>
  bootstrapApplication(AppComponent, {
    providers: [...appConfig.providers, provideServerRendering()],
  });

export default bootstrap;
