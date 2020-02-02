import { DebugElement } from '@angular/core';

import { MutableTree, Node, Path, tokenName } from '../../tree';

// The path we get is a series of numbers followed by the names of properties
// (in the case of emit or updateProperty). So we want to just pull the node
// path and omit the property names (although they are used later).
export const getNodeFromPartialPath = (tree: MutableTree, path: Path): Node => {
  const pindex = propertyIndex(path);

  return tree.traverse(path.slice(0, pindex));
};

// When we are emitting values or updating properties for a component, the path
// we get really contains two paths. The first is a path to the node itself,
// which is composed of indexes into the tree. Following that is a path to a
// property inside the componentInstance. The second path describes the piece
// of state that we wish to change or emit.
export const getPropertyPath = (path: Path): Path => {
  const index = propertyIndex(path);

  if (index === path.length) {
    // not found
    return [];
  }

  return path.slice(index);
};

// Get the value of an instance variable from a combination of a node path and
// a property path. (See the comment for {@link getPropertyPath} for details)
export const getInstanceFromPath = (instance, path: Path) => {
  if (instance == null) {
    return null;
  }

  const propertyPath = path.slice(0);

  while (propertyPath.length > 0) {
    instance = instance[propertyPath.shift()];
    if (instance == null) {
      return null;
    }
  }

  return instance;
};

export const getNodeProvider = (element: DebugElement, providerToken: string, propertyPath: Path) => {
  const token = element.providerTokens.find(t => tokenName(t) === providerToken);
  if (token == null) {
    return null;
  }

  const path = getPropertyPath(propertyPath.slice(0, propertyPath.length - 1));

  return getInstanceFromPath(element.injector.get(token), path);
};

// We want to retrieve the parent of the object described in {@param path}
export const getNodeInstanceParentIvy = (element: any, path: Path) => {
  if (path.length === 0) {
    return null;
  }

  const propertyPath = getPropertyPath(path.slice(0, path.length - 1));
  if (propertyPath.length > 0) {
    return getInstanceFromPath(element, propertyPath);
  } else {
    return element;
  }
};

// We want to retrieve the parent of the object described in {@param path}
export const getNodeInstanceParent = (element: DebugElement, path: Path) => {
  if (path.length === 0) {
    return null;
  }

  const propertyPath = getPropertyPath(path.slice(0, path.length - 1));
  if (propertyPath.length > 0) {
    return getInstanceFromPath(element.componentInstance, propertyPath);
  } else {
    return element.componentInstance;
  }
};

export const propertyIndex = (path: Path): number => {
  let index = 0;
  while (index < path.length) {
    if (typeof path[index] !== 'number') {
      break;
    }
    ++index;
  }
  return index;
};
