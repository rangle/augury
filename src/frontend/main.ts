import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';

import { FrontendModule } from './module';
import { buildConfig } from '../build.config';

if (buildConfig.prodMode) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(FrontendModule).catch(err => console.log(err));
