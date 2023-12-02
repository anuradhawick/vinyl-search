import { Amplify } from 'aws-amplify';
import { environment } from './environments/environment';

export { AppServerModule as default } from './app/app.module.server';

Amplify.configure(environment.aws_config);
