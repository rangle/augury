import { provideRouter, RouterConfig }  from '@angular/router';

import { KitchenSinkRoutes } from './containers/kitchen-sink';
import { StartRouter } from './components/router/start';

export const routes: RouterConfig = [
  ...KitchenSinkRoutes,
  ...StartRouter
];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(routes)
];
