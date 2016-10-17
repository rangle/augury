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

// *** Component Router ***
export function parseRoutes(router: any): MainRoute {
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
    const childDescendents: [any] = child._loadedConfig ? child._loadedConfig.routes : child.children;

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
  if (child.component) {
    return child.component.name;
  }
  if (child.loadChildren) {
    return `${child.path} [Lazy]`;
  }
  return 'no-name-route';
}
