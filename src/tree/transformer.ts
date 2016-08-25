import {cloneDeep} from 'lodash';

import {
  DebugElement,
  DebugNode,
} from '@angular/core';

import {
  Description,
  Property,
} from '../backend/utils/description';

import {Node} from './node';

import {
  Path,
  serializePath
} from './path';

import {serialize} from '../utils';

type Source = DebugElement & DebugNode;

type Cache = WeakMap<any, any>;

/// Transform a {@link DebugElement} or {@link DebugNode} element into a Node
/// object that is our local representation of the combined data of those two
/// types. It is important that our object be a deep-cloned copy of the element
/// in order for our tree comparisons to work. If we just create a reference to
/// the existing DebugElement data, that data will mutate over time and
/// invalidate the results of our comparison operations.
export const transform = (parentNode: Node, path: Path, element: Source,
    cache: Cache, html: boolean): Node => {
  if (element == null) {
    return null;
  }

  const load = <T>(key: string, creator: () => T) => {
    if (key == null) {
      return null;
    }

    let value = cache.get(key);
    if (value == null) {
      value = creator();
    }

    return value;
  };

  const serializedPath = serializePath(path);

  return load<Node>(serializedPath, () => {
    const key = (subkey: string) => serializePath(path.concat([subkey]));

    const listeners = element.listeners.map(l => cloneDeep(l));

    const name = (() => {
      if (element.componentInstance &&
          element.componentInstance.constructor) {
        return element.componentInstance.constructor.name;
      }
      else if (element.name) {
        return element.name;
      }
      else {
        return element.nativeElement.tagName.toLowerCase();
      }
    })();

    const injectors = element.providerTokens.map(t => t.name);

    const dependencies = () => {
      if (element.componentInstance == null) {
        return [];
      }

      const parameters = Reflect.getOwnMetadata('design:paramtypes',
        element.componentInstance.constructor) || [];

      return parameters.map(param => param.name);
    };

    const providers = getComponentProviders(element, name);

    const isComponent = element.componentInstance != null;

    const input = isComponent
      ? getComponentInputs(element)
      : [];

    const output = isComponent
      ? getComponentOutputs(element)
      : [];

    const assert = (): Node => {
      throw new Error('Parent should already have been created and cached');
    };

    const node: Node = {
      id: serializedPath,
      isComponent,
      attributes: cloneDeep(element.attributes),
      children: null,
      description: Description.getComponentDescription(element),
      classes: cloneDeep(element.classes),
      styles: cloneDeep(element.styles),
      injectors,
      input,
      output,
      name,
      listeners,
      properties: cloneDeep(element.properties),
      providers,
      dependencies: dependencies(),
      source: element.source,
      nativeElement: () => element.nativeElement // this will be null in the frontend
    };

    /// Set before we search for children so that the value is cached and the
    /// reference will be correcet when transform runs on the child
    cache.set(serializedPath, node);

    node.children = [];

    /// Show HTML elements or only components?
    if (html) {
      element.children.forEach((c, index) =>
        node.children.push(transform(node, path.concat([index]), c, cache, html)));
    }
    else {
      for (const child of element.children) {
        componentChildren(child).forEach((c, index) =>
          node.children.push(transform(node, path.concat([index]), c, cache, html)));
      }
    }

    return node;
  });
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
};

export const componentChildren = (element: Source): Array<Source> => {
  if (element.componentInstance) {
    return [element];
  }
  return recursiveSearch(element.children);
};

const getComponentProviders = (element: Source, name: string): Array<Property> => {
    let providers = new Array<Property>();

    if (element.providerTokens && element.providerTokens.length > 0) {
      providers = element.providerTokens.map(provider =>
        Description.getProviderDescription(provider,
          element.injector.get(provider)));
    }

    if (name) {
      return providers.filter(provider => provider.key !== name);
    }
    else {
      return providers;
    }
};

const getComponentInputs = (element: Source) => {
  const metadata = Reflect.getOwnMetadata('annotations',
    element.componentInstance.constructor);

  const inputs =
    (metadata && metadata.length > 0 && metadata[0].inputs) || [];

  const propMetadata = Reflect.getOwnMetadata('propMetadata',
    element.componentInstance.constructor);
  if (propMetadata == null) {
    return inputs;
  }

  for (const key of Object.keys(propMetadata)) {
    for (const meta of propMetadata[key]) {
      if (meta.constructor.name === 'InputMetadata') {
        if (inputs.indexOf(key) < 0) { // avoid duplicates
          if (meta.bindingPropertyName) {
            inputs.push(`${key}:${meta.bindingPropertyName}`);
          } else {
            inputs.push(key);
          }
        }
      }
    }
  }

  return inputs;
};

const getComponentOutputs = (element: Source): Array<string> => {
  const metadata = Reflect.getOwnMetadata('annotations',
    element.componentInstance.constructor);

  const outputs = (metadata && metadata.length > 0 && metadata[0].outputs) || [];

  const propMetadata = Reflect.getOwnMetadata('propMetadata',
    element.componentInstance.constructor);
  if (propMetadata == null) {
    return outputs;
  }

  for (const key of Object.keys(propMetadata)) {
    for (const meta of propMetadata[key]) {
      if (meta.constructor.name === 'OutputMetadata') {
        if (outputs.indexOf(key) < 0) { // avoid duplicates
          outputs.push(key);
        }
      }
    }
  }

  return outputs;
};

