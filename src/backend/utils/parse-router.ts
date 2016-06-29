import {RouteRule} from '@angular/router-deprecated/src/rules/rules';

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
    (value: RouteRule, name: string, isAux: boolean = false): Route {
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

export class ComponentRouterParser {
  public static parseConfigRoutes(router: any): MainRoute {
    const children = router.config.map((child, index) => {
      const childName = child.component ? child.component.name : 'no-name-route';
      // TODO: populate the schema of every child, every child corresponds to a path.
      return {
        depth: 1, // TODO: (ericjim) the children of the children will need this property incremented.
        // data: { data: } (???, I have no idea what this is)
        handler: childName,
        id: index, // TODO: (ericjim) is this the supposed id?
        // isAux: boolean (???, default False)
        name: childName,
        parent: root,
        path: `/${child.path}`
        // children: child.children // (Recursively resolve children's children)
      }
    });

    var root = {
      // id:
      name: "test",
      children: children,
      depth: 0,
      x: 0,
      y: 0
    };
    
    return root;
  }
}