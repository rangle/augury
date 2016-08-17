export interface Route {
  name: string;
  hash: string;
  path: string;
  specificity: string;
  handler: string;
  data: any;
  children?: Array<Route>;
  isAux: boolean;
}

export interface MainRoute {
  name: string;
  children: Array<Route>;
}

// *** Deprecated Router ***
export class ParseRouter {

  private static NAME_REGEX = /function ([^\(]*)/;

  public static parseRoutes(registry: any): MainRoute {
    const routes: Array<MainRoute> = new Array<MainRoute>();
    const rules = registry._rules;

    rules.forEach((key, value) => {
      routes.push(this.getMainRoute(key, value));
    });
    return this.flattenRoutes(routes);
  }

  private static mapRoutes(routes: any, subRoutes: any): void {
    routes.map((r) => {
      const e = subRoutes.filter(sr => sr.name === r.name);
      if (e.length > 0) {
        r.children = e[0].children;
        this.mapRoutes(r.children, subRoutes);
      }
      return r;
    });
  }

  private static flattenRoutes(routes: Array<MainRoute>): MainRoute {
    const appRoute: MainRoute = routes[0];
    const subRoutes: any = routes.slice(1);

    this.mapRoutes(appRoute.children, subRoutes);
    return appRoute;
  }

  private static getMainRoute(key: any, value: any): MainRoute {
    const name: string = this.NAME_REGEX.exec(value)[1];
    const children: Array<Route> = new Array<Route>();

    key.auxRulesByName.forEach((obj, route_name) => {
      children.push(this.getRoute(obj, route_name, true));
    });

    key.rulesByName.forEach((obj, route_name) => {
      children.push(this.getRoute(obj, route_name));
    });

    return {
      name,
      children
    };
  }

  private static getRoute
    (value: any, name: string, isAux: boolean = false): Route {
    const handler: string =
      this.NAME_REGEX.exec(value.handler.componentType + '')[1];

    return {
      name,
      handler,
      hash: value.hash,
      path: value.path,
      specificity: value.specificity,
      data: value.handler.data,
      isAux
    };
  }
}

export function IS_OLD_ROUTER_HACK(router) : boolean {

  // `config` key is different for both routers,
  // it's highly unlikely that the deprecated router will change this.
  const componentRouterConfigIsArray: boolean = Array.isArray(router.config);
  const deprecatedRouterConfigIsFunction: boolean =
    typeof router.config === 'function';
  const oldConfig =
    deprecatedRouterConfigIsFunction && !componentRouterConfigIsArray;

  // root of the app is stored in a different key.
  const deprecatedRootComponentKey: boolean =
    router.hasOwnProperty('root');
  const componentRouterRootComponentKey: boolean =
    router.hasOwnProperty('rootComponentType');
  const oldRoot =
    deprecatedRootComponentKey && !componentRouterRootComponentKey;

  return oldRoot && oldConfig;
}

// *** Component Router ***
export function parseConfigRoutes(router: any): MainRoute {
  const rootName = router.rootComponentType.name;
  const rootChildren: [any] = router.config;

  const root = {
    handler: rootName,
    name: rootName,
    path: '/',
    children: rootChildren ? assignChildrenToParent(null, rootChildren) : []
  };

  return root;
}

function assignChildrenToParent(parent, children): [any] {
  return children.map((child) => {
    const childName = childRouteName(child);
    const childDescendents: [any] = child.children;

    // only found in aux routes, otherwise property will be undefined
    const isAuxRoute = !!child.outlet;

    return {
      handler: childName,
      name: childName,
      parent: parent,
      path: `/${child.path}`,
      isAux: isAuxRoute,
      children: childDescendents ?
        assignChildrenToParent(this, childDescendents) : []
    };
  });
}

function childRouteName(child): string {
  return child.component ? child.component.name : 'no-name-route';
}
