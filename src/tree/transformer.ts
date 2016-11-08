import * as clone from 'clone';

import {
  ChangeDetectionStrategy,
  Component,
  DebugElement,
  DebugNode,
  Input,
  Output,
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

import {
  classDecorators,
  componentMetadata,
  componentInputs,
  componentOutputs,
  parameterTypes,
  propertyDecorators,
} from './decorators';

/// Transform a {@link DebugElement} or {@link DebugNode} element into a Node
/// object that is our local representation of the combined data of those two
/// types. It is important that our object be a deep-cloned copy of the element
/// in order for our tree comparisons to work. If we just create a reference to
/// the existing DebugElement data, that data will mutate over time and
/// invalidate the results of our comparison operations.
export const transform = (path: Path,
                          element: DebugElement,
                          options: SimpleOptions,
                          cache: Map<string, Node>,
                          count: (n: number) => void): Node => {
  if (element == null) {
    return null;
  }

  const serializedPath = serializePath(path);

  const existing = cache.get(serializedPath);
  if (existing) {
    return existing;
  }

  const listeners = element.listeners.map(l => clone(l));

  const name = getComponentName(element);

  const injectors = element.providerTokens.map(t => functionName(t));

  const providers = getComponentProviders(element, name).filter(p => p.key != null);

  const isComponent = element.componentInstance != null;

  const metadata = componentMetadata(element.componentInstance);

  const changeDetection = isComponent
    ? ChangeDetectionStrategy[getChangeDetection(metadata)]
    : null;

  const node: Node = {
    id: serializedPath,
    isComponent,
    attributes: clone(element.attributes),
    children: null,
    changeDetection,
    description: Description.getComponentDescription(element),
    directives: [],
    classes: clone(element.classes),
    styles: clone(element.styles),
    injectors,
    input: componentInputs(metadata, element.componentInstance),
    output: componentOutputs(metadata, element.componentInstance),
    name,
    listeners,
    properties: clone(element.properties),
    providers,
    dependencies: getDependencies(element.componentInstance),
    source: element.source,
    nativeElement: () => element.nativeElement // this will be null in the frontend
  };

  /// Set before we search for children so that the value is cached and the
  /// reference will be correct when transform runs on the child
  cache.set(serializedPath, node);

  node.children = [];

  const transformChildren = (children: Array<DebugElement>) => {
    let subindex = 0;

    children.forEach(c =>
        node.children.push(
          transform(path.concat([subindex++]), c, options, cache, count)));
  };

  const getChildren = (test: (compareElement: DebugElement) => boolean): Array<DebugElement> => {
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
};

export const recursiveSearch =
    (children: DebugElement[], test: (element: DebugElement) => boolean): Array<DebugElement> => {
  const result = new Array<DebugElement>();

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
    (element: DebugElement, test: (element: DebugElement) => boolean): Array<DebugElement> => {
  if (test(element)) {
    return [element];
  }
  return recursiveSearch(element.children, test);
};

const getComponentProviders = (element: DebugElement, name: string): Array<Property> => {
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

const getComponentName = (element: DebugElement): string => {
  if (element.componentInstance &&
      element.componentInstance.constructor) {
    return functionName(element.componentInstance.constructor);
  }
  else if (element.name) {
    return element.name;
  }

  return element.nativeElement.tagName.toLowerCase();
};

const getChangeDetection = (metadata: Component): ChangeDetectionStrategy => {
  if (metadata &&
    metadata.changeDetection !== undefined &&
    metadata.changeDetection !== null) {
    return metadata.changeDetection;
  } else {
    return ChangeDetectionStrategy.Default;
  }
};

const getDependencies = (instance): Array<string> => {
  if (instance == null) {
    return [];
  }
  return parameterTypes(instance).map(param => functionName(param));
};
