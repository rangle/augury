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

// *** Component Router ***
export function parseRoutes(router: any): Route {
  const rootName = router.rootComponentType ? router.rootComponentType.name : 'no-name';
  const rootChildren: [any] = router.config;

  const root: Route = {
    handler: rootName,
    name: rootName,
    path: '/',
    children: rootChildren ? assignChildrenToParent(null, rootChildren) : [],
    isAux: false,
    specificity: null,
    data: null,
    hash: null,
  };

  return root;
}

function assignChildrenToParent(parentPath, children): [any] {
  return children.map((child) => {
    const childName = childRouteName(child);
    const childDescendents: [any] = child._loadedConfig ? child._loadedConfig.routes : child.children;

    // only found in aux routes, otherwise property will be undefined
    const isAuxRoute = !!child.outlet;

    const pathFragment = child.outlet ? `(${child.outlet}:${child.path})` : child.path;

    const routeConfig: Route = {
      handler: childName,
      data: [],
      hash: null,
      specificity: null,
      name: childName,
      path: `${parentPath ? parentPath : ''}/${pathFragment}`.split('//').join('/'),
      isAux: isAuxRoute,
      children: [],
    };

    if (childDescendents) {
      routeConfig.children = assignChildrenToParent(routeConfig.path, childDescendents);
    }

    if (child.data) {
      for (const el in child.data) {
        if (child.data.hasOwnProperty(el)) {
          routeConfig.data.push({
            key: el,
            value: child.data[el],
          });
        }
      }
    }

    return routeConfig;
  });
}

function childRouteName(child): string {
  if (child.component) {
    return child.component.name;
  }
  else if (child.loadChildren) {
    return `${child.path} [Lazy]`;
  }
  else {
    return 'no-name-route';
  }
}
