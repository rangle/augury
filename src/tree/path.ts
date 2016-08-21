import {DebugElement} from '@angular/core';

export const pathToRoot = (debugElement: DebugElement): Array<DebugElement> => {
  const path = new Array<DebugElement>();

  let iterator = debugElement;
  while (iterator) {
    path.push(iterator);

    iterator = iterator.parent;
  }

  return path;
}

export const nodePath = (debugElement: DebugElement): Array<number> => {
  const indexOf = (path: Array<number>, element: DebugElement) => {
    const parent = element.parent;
    if (parent) {
      path.push(parent.children.indexOf(element));
    }

    return path;
  };

  return pathToRoot(debugElement).reduce(indexOf, new Array<number>());
};

export const serializeNodePath =
    (elementOrPath: DebugElement | Array<number>): string => {
  const pathKey = ' ';

  if (Array.isArray(elementOrPath)) {
    return elementOrPath.join(pathKey);
  }
  else {
    return nodePath(elementOrPath).join(pathKey);
  }
};

export const deserializeNodePath = (path: string) => {
  return path.split(/ /);
};
