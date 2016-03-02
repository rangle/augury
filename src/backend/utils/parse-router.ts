import {ComponentRecognizer} from 'angular2/src/router/component_recognizer';
import {RouteRecognizer} from 'angular2/src/router/route_recognizer';

export interface Route {
  name: string;
  hash: string;
  path: string;
  specificity: string;
  handler: string;
  data: any;
}

export interface MainRoute {
  name: string;
  routes: Array<Route>;
}

export class ParseRouter {

  private static NAME_REGEX = /function ([^\(]*)/;

  public static parseRoutes(registry: any): Array<MainRoute> {
    const routes: Array<MainRoute> = new Array<MainRoute>();
    const rules = registry._rules;

    rules.forEach((key, value) => {
      routes.push(this.getMainRoute(key, value));
    });

    return routes;
  }

  private static getMainRoute(key: ComponentRecognizer, value: any): MainRoute {
    const name: string = this.NAME_REGEX.exec(value)[1];
    const routes: Array<Route> = new Array<Route>();

    key.names.forEach((obj, route_name) => {
      routes.push(this.getRoute(obj, route_name));
    });

    return {
      name,
      routes
    };
  }

  private static getRoute(value: RouteRecognizer, name: string): Route {
    const handler: string =
      this.NAME_REGEX.exec(value.handler.componentType + '')[1];

    return {
      name,
      handler,
      hash: value.hash,
      path: value.path,
      specificity: value.specificity,
      data: value.handler.data
    };
  }
}
