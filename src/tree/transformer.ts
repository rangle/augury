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

import {
  DecoratorDisplay,
  DecoratorDisplayMap,
  Node,
} from './node';

import {
  Path,
  serializePath,
} from './path';

import {
  functionName,
  serialize,
} from '../utils';

type Source = DebugElement & DebugNode;

type Cache = Map<string, any>;

/// Transform a {@link DebugElement} or {@link DebugNode} element into a Node
/// object that is our local representation of the combined data of those two
/// types. It is important that our object be a deep-cloned copy of the element
/// in order for our tree comparisons to work. If we just create a reference to
/// the existing DebugElement data, that data will mutate over time and
/// invalidate the results of our comparison operations.
export const
transform = (path: Path, element: Source, cache: Cache, options: SimpleOptions, count: (n: number) => void): Node => {
  if (element == null) {
    return null;
  }

  const serializedPath = serializePath(path);

  const value = cache.get(serializedPath);
  if (value != null) {
    return value;
  } else {
    const key = (subkey: string) => serializePath(path.concat([subkey]));

    const listeners = element.listeners.map(l => clone(l));

    const name = (() => {
      if (element.componentInstance &&
          element.componentInstance.constructor) {
        return functionName(element.componentInstance.constructor);
      } else if (element.name) {
        return element.name;
      } else {
        return element.nativeElement.tagName.toLowerCase();
      }
    })();

    const injectors = element.providerTokens.map(t => functionName(t));

    const dependencies = () => {
      if (element.componentInstance == null) {
        return [];
      }

      const parameters = Reflect.getOwnMetadata('design:paramtypes', element.componentInstance.constructor) || [];

      return parameters.map(param => functionName(param));
    };

    const providers = getComponentProviders(element, name).filter(p => p.key != null);

    const isComponent = element.componentInstance != null;

    const metadata = isComponent ? getMetadata(element) : null;

    const changeDetection = isComponent ? ChangeDetectionStrategy[getChangeDetection(metadata)] : null;

    const decorators = isComponent ? getComponentDecorators(metadata, element) : <DecoratorDisplayMap>{};

    const directives = isComponent ? getComponentDirectives(metadata) : [];

    const node: Node = {
      changeDetection,
      children: null,
      decorators,
      dependencies: dependencies(),
      description: Description.getComponentDescription(element),
      directives,
      id: serializedPath,
      injectors,
      isComponent,
      listeners,
      name,
      nativeElement: () => element.nativeElement, // this will be null in the frontend
      providers,
    };

    /// Set before we search for children so that the value is cached and the
    /// reference will be correcet when transform runs on the child
    cache.set(serializedPath, node);

    node.children = [];

    const transformChildren = (children: Array<Source>) => {
      let i = 0;
      for (const child of children) {
        node.children.push(transform(path.concat([i++]), child, cache, options, count));
      }
    };

    const transformMatchingChildren = (test: (compareElement: Source) => boolean) => {
      let i = 0;
      for (const child of element.children) {
        for (const match of matchingChildren(child, test)) {
          node.children.push(transform(path.concat([i++]), match, cache, options, count));
        }
      }
    };

    switch (options.componentView) {
    case ComponentView.Hybrid:
      transformMatchingChildren(e => e.providerTokens && !!e.providerTokens.length);
      break;
    case ComponentView.All:
      transformChildren(element.children);
      break;
    case ComponentView.Components:
      transformMatchingChildren(e => e.componentInstance != null);
      break;
    }

    count(1 + node.children.length);

    return node;
  }
};

export const recursiveSearch =
    (children: Source[], test: (element: Source) => boolean): Array<Source> => {
  const result = new Array<Source>();

  for (const c of children) {
    if (test(c)) {
      result.push(c);
    } else {
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
    } else {
      return providers;
    }
};

const getMetadata = (element: Source): Component => {
  const annotations = Reflect.getOwnMetadata('annotations', element.componentInstance.constructor);
  if (annotations) {
    for (const decorator of annotations) {
      if (functionName(decorator.constructor) === 'Component') {
        return decorator;
      }
    }
  }
  return null;
};

const getComponentDirectives = (metadata: Component): Array<string> => {
  /* TODO: Figure out which directives are invoked by checking selectors against the template. */
  return [];
};

const getComponentDecorators = (metadata: Component, element: Source) => {
  const decorators: DecoratorDisplayMap = {};
  const propMetadata = Reflect.getOwnMetadata('propMetadata', element.componentInstance.constructor);

  if (propMetadata) {
    for (const key of Object.keys(propMetadata)) {
      const accum = decorators[key] = [];
      for (const meta of propMetadata[key]) {
        const name = meta.toString();
        const dd: DecoratorDisplay = {
          name: name,
        };

        switch (name) {
        case '@Input':
        case '@Output':
          if (meta.bindingPropertyName) {
            dd.arg = meta.bindingPropertyName;
          }
          break;
        case '@Query':
        case '@ViewQuery':
        case '@ViewChild':
        case '@ViewChildren':
          /* This is not technically complete,
           * as there is an optional second parameter
           * to some of these Decorators. */
          dd.arg = meta.selector;
          break;
        }

        accum.push(dd);
      }
    }
  }

  return decorators;
};

const getChangeDetection = (metadata: Component): ChangeDetectionStrategy => {
   if (metadata == null ||
       metadata.changeDetection == null) {
     return ChangeDetectionStrategy.Default;
  }
  return metadata.changeDetection;
};
