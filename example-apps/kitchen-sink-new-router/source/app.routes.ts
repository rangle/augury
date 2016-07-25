import { provideRouter, RouterConfig }  from '@angular/router';

import { KitchenSinkRoutes } from './containers/kitchen-sink.routes';
import { RouterRoutes } from './components/router/router.routes';

export const routes: RouterConfig = [
  ...KitchenSinkRoutes,
  ...RouterRoutes
];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(routes)
];
