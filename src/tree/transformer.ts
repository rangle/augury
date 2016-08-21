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
import {nodePath, serializePath} from './path';
import {serialize} from '../utils/serialize';

type Source = DebugElement & DebugNode;

type Cache = WeakMap<any, any>;

/// Transform a {@link DebugElement} or {@link DebugNode} element into a Node
/// object that is our local representation of the combined data of those two
/// types. It is important that our object be a deep-cloned copy of the element
/// in order for our tree comparisons to work. If we just create a reference to
/// the existing DebugElement data, that data will mutate over time and
/// invalidate the results of our comparison operations.
export const transform =
    (parentNode: Node, path: number[], element: Source, cache: Cache): Node => {
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

  /// NOTE(cbond): The following comment is misleading because right now
  /// we actually do not need a copy of the component instance or context
  /// in the frontend. But if we do later want to send that information,
  /// then the comment applies.
  ///
  /// Data that we do not control, for example component instance, context,
  /// etc., we must use our reconstructing serializer since it may -- and
  /// typically does -- contain circular references and so forth. These
  /// objects are reconstructed once they pass the object boundary.

  const serializedPath = serializePath(path);

  return load<Node>(serializedPath, () => {
    // const componentInstance = load(element.componentInstance,
    //   () => serialize(element.componentInstance));

    // const context = load(element.context, () => serialize(element.context));

    const listeners = element.listeners.map(l => cloneDeep(l));

    const name = (() => {
      if (element.componentInstance.constructor) {
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
      const parameters = Reflect.getOwnMetadata('design:paramtypes',
        element.componentInstance.constructor) || [];

      return parameters.map(param => param.name);
    };

    const providers = getComponentProviders(element, name);

    const input = getComponentInputs(element);

    const output = getComponentOutputs(element);

    const assert = (): Node => {
      throw new Error('Parent should already have been created and cached');
    }

    const node: Node = {
      id: serializedPath,
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
      parent: parentNode,
      properties: cloneDeep(element.properties),
      providers,
      dependencies: dependencies(),
      source: element.source,
      nativeElement: 'insert-xpath-here',
    };

    /// Set before we search for children so that the value is cached and the
    /// reference will be correcet when transform runs on the child
    cache.set(serializedPath, node);

    node.children = [];

    for (const child of element.children) {
      componentChildren(child).forEach((c, index) =>
        node.children.push(transform(node, path.concat([index]), c, cache)));
    }

    return node;
  });
}

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
}

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
            inputs.push(`${key}: bound to ${meta.bindingPropertyName}`);
          } else {
            inputs.push(key);
          }
        }
      }
    }
  }
};

const getComponentOutputs = (element: Source) => {
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
}
