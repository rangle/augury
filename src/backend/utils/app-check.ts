import { BehaviorSubject, Observable } from 'rxjs';
import { parseModulesFromRootElement } from './parse-modules';

declare const getAllAngularTestabilities: Function;
declare const getAllAngularRootElements: Function;
declare const ng: any;

export const isAngular = () => {
  return (
    typeof getAllAngularTestabilities === 'function' &&
    typeof getAllAngularRootElements === 'function' &&
    typeof ng !== 'undefined'
  );
};

export const isDebugMode = () => {
  if (typeof getAllAngularRootElements === 'function' && typeof ng !== 'undefined' && typeof ng.probe !== 'undefined') {
    const rootElements = getAllAngularRootElements();
    const firstRootDebugElement = rootElements && rootElements.length ? ng.probe(rootElements[0]) : null;

    return firstRootDebugElement !== null && firstRootDebugElement !== void 0 && firstRootDebugElement.injector;
  } else if (typeof getAllAngularRootElements === 'function') {
    const rootElements = getAllAngularRootElements();
    return rootElements[0];
  }
  return false;
};

export const isIvyVersion = () => {
  return typeof ng !== 'undefined' && typeof ng.getComponent === 'function';
};

export const ivySubject: BehaviorSubject<void> = new BehaviorSubject(null);

let originalTemplateFunction: Function;

// Use this function sparingly. The use case for this is in situations
// where there is large pieces of functionality that must be implemented
// differently in post-R3 than it is currently in pre-R3. See appIsStable()
// for an example.
//
// It is best to create an api that calls this method
// on application load to determine functionality, and then have all other
// application code call on that API instead of calling this method
// directly.
//
// In cases where there is code that we only want to run for pre-R3 or
// post-R3 use the isIvyVersion() function directly in an if statement or
// pass code in as a callback to the runForPreR3() / runForPostR3() functions
export const runInCompatibilityMode = (options: {
  ivy: { callback: Function; args?: Array<any> };
  fallback: { callback: Function; args?: Array<any> };
}) => {
  let { callback, args } = isIvyVersion() ? options.ivy : options.fallback;
  return callback.apply(this, args || []);
};

export const runForPreR3 = callback => {
  if (!isIvyVersion()) {
    callback();
  }
};

export const runForPostR3 = callback => {
  if (isIvyVersion()) {
    callback();
  }
};

export const appIsStable = stabilityObject => {
  return runInCompatibilityMode({
    ivy: {
      callback: () => {
        const app = ng.getComponent(getAllAngularRootElements()[0]);
        // Uses private api ɵcmp
        const appTemplateView = app.constructor.ɵcmp.tView;
        originalTemplateFunction = originalTemplateFunction || appTemplateView.template;
        appTemplateView.template = (...args) => {
          originalTemplateFunction.apply(this, [...args]);
          runOutsideAngular(() => {
            setTimeout(() => {
              ivySubject.next();
            });
          });
        };
        return ivySubject as Observable<null>;
      }
    },
    fallback: {
      callback: moduleParserHelperObject => {
        // side effect
        moduleParserHelperObject.appRef = parseModulesFromRootElement(
          moduleParserHelperObject.roots[0],
          moduleParserHelperObject.parsedModulesData
        );
        return moduleParserHelperObject.appRef.isStable;
      },
      args: [stabilityObject]
    }
  });
};

export const runOutsideAngular = (f: () => any) => {
  const w = window as any;
  if (!w.Zone || w.Zone.current._name !== 'angular') {
    return;
  }
  w.Zone.current._parent.run(f);
};
