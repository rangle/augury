import {Node} from './node';

export const pathToRoot = (node: Node): Array<Node> => {
  const path = new Array<Node>();

  let iterator = node;
  while (iterator) {
    path.push(iterator);

    iterator = iterator.parent;
  }

  return path;
}

export const nodePath = (node: Node): Array<number> => {
  if (node == null) {
    return [];
  }

  const indexOf = (path: Array<number>, element: Node) => {
    const parent = element.parent;
    if (parent) {
      const index = parent.children.indexOf(element);
      if (index < 0) {
        debugger;
        throw new Error('Child-parent relationship is corrupted');
      }
      path.unshift(index);
    }

    return path;
  };

  return pathToRoot(node).reduce(indexOf, new Array<number>());
};

export const serializePath =
    (elementOrPath: Node | Array<number>): string => {
  const pathKey = ' ';

  if (Array.isArray(elementOrPath)) {
    return elementOrPath.join(pathKey);
  }
  else {
    return nodePath(elementOrPath).join(pathKey);
  }
};

export const deserializePath = (path: string) => {
  return path.split(/ /).map(n => parseInt(n, 10));
};
