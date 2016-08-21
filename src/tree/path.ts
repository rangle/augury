import {Node} from './node';

export type Path = Array<string | number>;

export const pathToRoot = (node: Node): Array<Node> => {
  const path = new Array<Node>();

  let iterator = node;
  while (iterator) {
    path.push(iterator);

    iterator = iterator.parent;
  }

  return path;
}

export const nodePath = (roots, node: Node): Path => {
  if (node == null) {
    return [];
  }

  const indexOf = (path: Path, element: Node) => {
    const parent = element.parent;
    if (parent) {
      const index = parent.children.indexOf(element);
      if (index < 0) {
        debugger;
        throw new Error('Child-parent relationship is corrupted');
      }
      path.unshift(index);
    }
    else {
      const rootIndex = roots.indexOf(element);
      if (rootIndex < 0) {
        throw new Error('Cannot find root node for element');
      }
      path.unshift(rootIndex);
    }

    return path;
  };

  return pathToRoot(node).reduce(indexOf, new Array<string | number>());
};

export const serializePath = (path: Path): string => {
  return path.join(' ');
};

export const deserializePath = (path: string): Path => {
  return path.split(/ /).map(piece => {
    const v = parseInt(piece, 10);
    if (isNaN(v)) {
      return piece;
    }
    return v;
  });
};