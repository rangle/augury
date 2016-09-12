import * as clone from 'clone';

import {
  ChangeDetectionStrategy,
  ComponentMetadata,
  DebugElement,
  DebugNode,
  InputMetadata,
  OutputMetadata,
} from '@angular/core';

import {
  Description,
  Property,
} from '../backend/utils/description';

import {
  ComponentView,
  SimpleOptions,
} from '../options';

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
    path: Path,
    element: Source,
    cache: Cache,
    options: SimpleOptions,
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

    const listeners = element.listeners.map(l => clone(l));

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

    const providers = getComponentProviders(element, name).filter(p => p.key != null);

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

    const cloneAndTransform = object => {
      const copy = clone(object);

      for (const k of Object.keys(copy)) {
        if (copy[k] === undefined) { // undefined values cause json patch to misbehave
          delete copy[k];
        }
      }

      return copy;
    };

    const node: Node = {
      id: serializedPath,
      isComponent,
      attributes: cloneAndTransform(element.attributes),
      children: null,
      changeDetection,
      description: Description.getComponentDescription(element),
      directives,
      classes: cloneAndTransform(element.classes),
      styles: cloneAndTransform(element.styles),
      injectors,
      input,
      output,
      name,
      listeners,
      properties: cloneAndTransform(element.properties),
      providers,
      dependencies: dependencies(),
      source: element.source,
      nativeElement: () => element.nativeElement // this will be null in the frontend
    };

    /// Set before we search for children so that the value is cached and the
    /// reference will be correcet when transform runs on the child
    cache.set(serializedPath, node);

    node.children = [];

    const transformChildren = (children: Array<Source>) => {
      let subindex = 0;

      children.forEach(c =>
          node.children.push(
            transform(path.concat([subindex++]), c, cache, options, count)));
    };

    const getChildren = (test: (compareElement: Source) => boolean): Array<Source> => {
      const children = element.children.map(c => matchingChildren(c, test));

      return children.reduce((previous, current) => previous.concat(current), []);
    };

    const childComponents = () => {
      return getChildren(e => e.componentInstance != null);
    };

    const childHybridComponents = () => {
      return getChildren(e => e.providerTokens && e.providerTokens.length > 0);
    };

    switch (options.componentView) {
      case ComponentView.Hybrid:
        transformChildren(childHybridComponents());
        break;
      case ComponentView.All:
        transformChildren(element.children);
        break;
      case ComponentView.Components:
        transformChildren(childComponents());
        break;
    }

    count(1 + node.children.length);

    return node;
  });
};

export const recursiveSearch =
    (children: Source[], test: (element: Source) => boolean): Array<Source> => {
  const result = new Array<Source>();

  for (const c of children) {
    if (test(c)) {
      result.push(c);
    }
    else {
      Array.prototype.splice.apply(result,
        (<Array<any>> [result.length - 1, 0]).concat(recursiveSearch(c.children, test)));
    }
  }

  return result;
};

export const matchingChildren =
    (element: Source, test: (element: Source) => boolean): Array<Source> => {
  if (test(element)) {
    return [element];
  }
  return recursiveSearch(element.children, test);
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
  /* TODO: Figure out which directives are invoked by checking selectors against the template. */
  return [];
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
