import { RouterModule }  from '@angular/router';

import { KitchenSinkRoutes, KitchenSinkDeclarations }
 from './containers/kitchen-sink.routes';
import { RouterRoutes, RouterDeclarations }
 from './components/router/router.routes';

export const routes = [
  ...KitchenSinkRoutes,
  ...RouterRoutes
];

export const APP_DECLARATIONS = [
  ...KitchenSinkDeclarations,
  ...RouterDeclarations
];

export const APP_ROUTER_PROVIDERS = RouterModule.forRoot(routes);
