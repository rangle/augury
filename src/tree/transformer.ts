import {cloneDeep} from 'lodash';

import {
  ChangeDetectionStrategy,
  ComponentMetadata,
  InputMetadata,
  OutputMetadata,
  DebugElement,
  DebugNode,
} from '@angular/core';

import {
  Description,
  Property,
} from '../backend/utils/description';

import {Node} from './node';

import {Path, serializePath} from './path';

import {functionName, serialize} from '../utils';

type Source = DebugElement & DebugNode;

type Cache = WeakMap<any, any>;

/// Transform a {@link DebugElement} or {@link DebugNode} element into a Node
/// object that is our local representation of the combined data of those two
/// types. It is important that our object be a deep-cloned copy of the element
/// in order for our tree comparisons to work. If we just create a reference to
/// the existing DebugElement data, that data will mutate over time and
/// invalidate the results of our comparison operations.
export const transform = (
    parentNode: Node,
    path: Path,
    element: Source,
    cache: Cache,
    html: boolean,
    count: (n: number) => void): Node => {
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
        return functionName(element.componentInstance.constructor);
      }
      else if (element.name) {
        return element.name;
      }
      else {
        return element.nativeElement.tagName.toLowerCase();
      }
    })();

    const injectors = element.providerTokens.map(t => functionName(t));

    const dependencies = () => {
      if (element.componentInstance == null) {
        return [];
      }

      const parameters = Reflect.getOwnMetadata('design:paramtypes',
        element.componentInstance.constructor) || [];

      return parameters.map(param => functionName(param));
    };

    const providers = getComponentProviders(element, name);

    const isComponent = element.componentInstance != null;

    const metadata = isComponent
      ? getMetadata(element)
      : null;

    const changeDetection = isComponent
      ? ChangeDetectionStrategy[getChangeDetection(metadata)]
      : null;

    const input = isComponent
      ? getComponentInputs(metadata, element)
      : [];

    const output = isComponent
      ? getComponentOutputs(metadata, element)
      : [];

    const directives = isComponent
      ? getComponentDirectives(metadata)
      : [];

    const assert = (): Node => {
      throw new Error('Parent should already have been created and cached');
    };

    const node: Node = {
      id: serializedPath,
      isComponent,
      attributes: cloneDeep(element.attributes),
      children: null,
      changeDetection,
      description: Description.getComponentDescription(element),
      directives,
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
        node.children.push(transform(node, path.concat([index]), c, cache, html, count)));
    }
    else {
      let subindex = 0;

      element.children.forEach(outerChild => {
        const components = componentChildren(outerChild);

        components.forEach(component => {
          node.children.push(transform(node, path.concat([subindex++]), component, cache, html, count));
        });
      });
    }

    count(1 + node.children.length);

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

const getMetadata = (element: Source): ComponentMetadata => {
  const annotations =
    Reflect.getOwnMetadata('annotations', element.componentInstance.constructor);
  if (annotations) {
    for (const decorator of annotations) {
      if (functionName(decorator.constructor) === functionName(ComponentMetadata)) {
        return decorator;
      }
    }
  }
  return null;
};

const getComponentDirectives = (metadata: ComponentMetadata): Array<string> => {
  if (metadata == null || metadata.directives == null) {
    return [];
  }

  return metadata.directives.map(d => functionName(d as any));
};

const getComponentInputs = (metadata: ComponentMetadata, element: Source) => {
  const inputs = metadata && metadata.inputs
    ? metadata.inputs
    : [];

  eachProperty(element,
    (key: string, meta) => {
      if (functionName(meta.constructor) === functionName(InputMetadata) && inputs.indexOf(key) < 0) {
        const property = meta.bindingPropertyName
          ? `${key}:${meta.bindingPropertyName}`
          : key;
        inputs.push(property);
      }
    });

  return inputs;
};

const getComponentOutputs = (metadata: ComponentMetadata, element: Source): Array<string> => {
 const outputs = metadata && metadata.outputs
    ? metadata.outputs
    : [];

  eachProperty(element,
    (key: string, meta) => {
      if (functionName(meta.constructor) === functionName(OutputMetadata) && outputs.indexOf(key) < 0) {
        outputs.push(key);
      }
    });

  return outputs;
};

const eachProperty = (element: Source, fn: (key: string, decorator) => void) => {
  const propMetadata = Reflect.getOwnMetadata('propMetadata', element.componentInstance.constructor);
  if (propMetadata) {
    for (const key of Object.keys(propMetadata)) {
      for (const meta of propMetadata[key]) {
        fn(key, meta);
      }
    }
  }
};

const getChangeDetection = (metadata: ComponentMetadata): ChangeDetectionStrategy => {
   if (metadata == null ||
       metadata.changeDetection == null) {
     return ChangeDetectionStrategy.Default;
  }
  return metadata.changeDetection;
};
