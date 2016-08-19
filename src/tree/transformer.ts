import {cloneDeep} from 'lodash';

import {
  DebugElement,
  DebugNode,
} from '@angular/core';

import {Node} from './node';
import {Tree} from './tree';

import {serialize} from '../utils/serialize';

type Source = DebugElement & DebugNode;

type Cache = WeakMap<any, any>;

export const transform = (element: Source, cache: Cache): Node => {
  if (element == null) {
    return null;
  }

  const getOrCreate = <T>(key, creator: () => T) => {
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

  return getOrCreate<Node>(element, () => {
    const componentInstance =
      getOrCreate(element.componentInstance, () => serialize(element.componentInstance));

    const context = getOrCreate(element.context, () => serialize(element.context));

    const properties = cloneDeep(element.properties);
    const attributes = cloneDeep(element.attributes);
    const classes = cloneDeep(element.classes);
    const styles = cloneDeep(element.styles);

    const children = element.children.map(c => this.transform(c, cache));

    const listeners = element.listeners.map(
      l => ({name: l.name, callback: l.callback}));

    return {
      attributes,
      classes,
      styles,
      children,
      name: element.name,
      listeners,
      properties,
      componentInstance,
      context,
      source: element.source,
      nativeElement: 'insert-xpath-here',
    };
  });
}
