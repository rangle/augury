import * as clone from 'clone';
// const clone = require('rfdc')();

import {
  Description,
  Property,
  Dependency,
  getComponentName,
  isDebugElementComponent
} from '../backend/utils/description-ivy';

import { ComponentView, SimpleOptions } from '../options';

import { Node } from './node';
import { Path, serializePath } from './path';
import { functionName, serialize } from '../utils';
import { isIvyVersion } from '../backend/utils/app-check';

import {
  componentMetadata,
  componentInputs,
  componentOutputs,
  parameterTypes,
  injectedParameterDecorators
} from './decorators-ivy';

import { AUGURY_TOKEN_ID_METADATA_KEY } from '../backend/utils/parse-modules';

declare const ng;

/// Transform a {@link DebugElement} or {@link DebugNode} element into a Node
/// object that is our local representation of the combined data of those two
/// types. It is important that our object be a deep-cloned copy of the element
/// in order for our tree comparisons to work. If we just create a reference to
/// the existing DebugElement data, that data will mutate over time and
/// invalidate the results of our comparison operations.
export const transformIvy = (
  path: Path,
  element,
  options: SimpleOptions,
  cache: Map<string, Node>,
  count: (n: number) => void
): Node => {
  if (element == null) {
    return null;
  }

  const serializedPath = serializePath(path);

  const existing = cache.get(serializedPath);
  if (existing) {
    return existing;
  }

  const listeners = element.listeners ? element.listeners.map(l => clone(l)) : [];
  const name = getComponentName(element);
  const isComponent = isDebugElementComponent(element);

  const metadata = element.componentInstance ? componentMetadata(element.componentInstance.constructor) : null;

  const changeDetection = null;

  const node: Node = {
    id: serializedPath,
    augury_token_id: element.componentInstance
      ? Reflect.getMetadata(AUGURY_TOKEN_ID_METADATA_KEY, element.componentInstance.constructor)
      : null,
    name,
    listeners,
    isComponent,
    providers: getComponentProviders(element, name).filter(p => p.key != null),
    // attributes: hostElement ? clone(hostElement.attributes) : null,
    // classes: hostElement ? clone(hostElement.classes) : null,
    // styles: hostElement ? clone(hostElement.styles) : null,
    attributes: null,
    classes: null,
    styles: null,
    children: null, // initial value
    directives: [],
    source: element.source,
    changeDetection,
    nativeElement: () => element, // this will be null in the frontend
    description: Description.getComponentDescription(element),
    input: null,
    output: null,
    properties: null,
    dependencies: []
    // dependencies: isDebugElementComponent(element) ? getDependencies(element.componentInstance) : [],
  };
  /// Set before we search for children so that the value is cached and the
  /// reference will be correct when transform runs on the child
  cache.set(serializedPath, node);

  node.children = [];

  const transformChildren = (children: Array<any>) => {
    let subindex = 0;

    children.forEach(c => node.children.push(transformIvy(path.concat([subindex++]), c, options, cache, count)));
  };

  const getChildren = (test: (compareElement) => boolean): Array<any> => {
    const children = Array.from(ng.getHostElement(element).children).map(c => matchingChildren(c, test));

    return children.reduce((previous, current) => previous.concat(current), []);
  };

  const childComponents = () => {
    return getChildren(e => !!ng.getComponent(e));
  };

  const childHybridComponents = () => {
    return getChildren(e => !!ng.getComponent(e) || ng.getDirectives(e).length > 0);
  };

  switch (options.componentView) {
    case ComponentView.Hybrid:
      transformChildren(childHybridComponents());
      break;
    case ComponentView.All:
      transformChildren(element.children);
      // transformChildren(ng.getHostElement(element).children);
      break;
    case ComponentView.Components:
      transformChildren(childComponents());
      break;
  }

  count(1 + node.children.length);

  return node;
};

export const recursiveSearch = (children: any[], test: (element) => boolean): Array<any> => {
  const result = new Array<any>();

  for (const c of children) {
    if (test(c)) {
      result.push(c);
    } else {
      Array.prototype.splice.apply(result, (<Array<any>>[result.length, 0]).concat(recursiveSearch(c.children, test)));
    }
  }

  return result;
};

export const matchingChildren = (element, test: (element) => boolean): Array<any> => {
  if (test(element)) {
    return [element];
  }
  return recursiveSearch(element.children, test);
};

const getComponentProviders = (element, name: string): Array<Property> => {
  let providers = new Array<Property>();

  if (element.providerTokens && element.providerTokens.length > 0) {
    providers = element.providerTokens.map(provider =>
      Description.getProviderDescription(provider, element.injector.get(provider))
    );
  }

  if (name) {
    return providers.filter(provider => provider.key !== name);
  } else {
    return providers;
  }
};

const getChangeDetection = (metadata): number => {
  if (metadata && metadata.changeDetection !== undefined && metadata.changeDetection !== null) {
    return metadata.changeDetection;
  } else {
    return 1;
  }
};

const getDependencies = (instance): Array<Dependency> => {
  const parameterDecorators = injectedParameterDecorators(instance) || [];

  const normalizedParamTypes = parameterTypes(instance).map((type, i) => {
    return type
      ? type
      : Array.isArray(parameterDecorators[i])
      ? (() => {
          const decoratorToken = parameterDecorators[i].find(item => item.token !== undefined);
          return decoratorToken ? decoratorToken.token : 'unknown';
        })()
      : 'unknown';
  });

  return normalizedParamTypes
    .filter(paramType => typeof paramType === 'function')
    .map((paramType, i) => ({
      id: Reflect.getMetadata(AUGURY_TOKEN_ID_METADATA_KEY, paramType),
      name: functionName(paramType) || paramType.toString(),
      decorators: parameterDecorators[i] ? parameterDecorators[i].map(d => d.toString()) : []
    }));
};
