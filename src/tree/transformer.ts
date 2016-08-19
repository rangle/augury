import {cloneDeep} from 'lodash';

import {
  DebugElement,
  DebugNode,
} from '@angular/core';

import {Node} from './node';

import {getUniqueIdentifier} from '../communication';

import {
  deserialize,
  serialize,
} from '../utils/serialize';

type Source = DebugElement & DebugNode;

type Cache = WeakMap<any, any>;

export const transform = (element: Source, cache: Cache): Node => {
  if (element == null) {
    return null;
  }

  const load = <T>(key, creator: () => T) => {
    if (key == null) {
      return null;
    }

    let value = cache.get(key);
    if (value == null) {
      value = creator();
      cache.set(key, value);
    }

    return value;
  };

  // const functionRepresentation = object => serialize(object);
  const functionRepresentation = object => object;

  return load<Node>(element, () => {
    const componentInstance = load(element.componentInstance,
      () => functionRepresentation(element.componentInstance));

    const context = load(element.context,
      () => functionRepresentation(element.context));

    const listeners = element.listeners.map(l => cloneDeep(l));

    const name = () => {
      if (element.componentInstance.constructor) {
        return element.componentInstance.constructor.name;
      }
      else if (element.name) {
        return element.name;
      }
      else {
        return element.nativeElement.tagName.toLowerCase();
      }
    }

    const injectors = element.providerTokens.map(t => t.name);

    const node: Node = {
      id: getUniqueIdentifier(),
      attributes: cloneDeep(element.attributes),
      children: null,
      classes: cloneDeep(element.classes),
      styles: cloneDeep(element.styles),
      injectors,
      name: name(),
      listeners,
      properties: cloneDeep(element.properties),
      componentInstance,
      context,
      source: element.source,
      nativeElement: 'insert-xpath-here',
    };

    node.children = [];

    for (const child of element.children) {
      componentChildren(child).forEach(c => node.children.push(transform(c, cache)));
    }

    return node;
  });
}

const recursiveComponentSearch = (element: Source): Array<Source> => {
  if (element.componentInstance == null) {
    const children = new Array<Source>();

    const concat = (c: Array<Source>) => children.concat(c);

    element.children.forEach(c => concat(recursiveComponentSearch(c)));
  }
  else {
    return [element];
  }
};

export const recursiveSearch = (children: Source[]): Array<Source> => {
  const result = new Array<Source>();

  for (const c of children) {
    if (c.componentInstance) {
      result.push(c);
    }
    else {
      Array.prototype.splice.apply(result,
        (<Array<any>> [result.length - 1, 0]).concat(recursiveSearch(c.children)));
    }
  }

  return result;
}

export const componentChildren = (element: Source): Array<Source> => {
  if (element.componentInstance) {
    return [element];
  }
  return recursiveSearch(element.children);
}
