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

  const clone = object => deserialize(serialize(object));

  return load<Node>(element, () => {
    const componentInstance =
      load(element.componentInstance, () => clone(element.componentInstance));

    const context = load(element.context, () => clone(element.context));

    const properties = cloneDeep(element.properties);
    const attributes = cloneDeep(element.attributes);
    const classes = cloneDeep(element.classes);
    const styles = cloneDeep(element.styles);

    const listeners = element.listeners.map(l => cloneDeep(l));

    const node = {
      id: getUniqueIdentifier(),
      attributes,
      children: null,
      classes,
      styles,
      name: element.name,
      listeners,
      properties,
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