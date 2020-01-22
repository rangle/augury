import { BehaviorSubject, Observable } from 'rxjs';
import { parseModulesFromRootElement } from './parse-modules';

declare const getAllAngularTestabilities: Function;
declare const getAllAngularRootElements: Function;
declare const ngCore: any;
declare const ng: any;

export const isAngular = () => {
  return typeof getAllAngularTestabilities === 'function' && typeof getAllAngularRootElements === 'function';
};

export const isDebugMode = () => {
  if (typeof getAllAngularRootElements === 'function' && typeof ngCore !== 'undefined') {
    const rootElements = getAllAngularRootElements();
    const firstRootDebugElement = rootElements && rootElements.length ? ngCore.getDebugNode(rootElements[0]) : null;

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

// Use this function sparingly. Overuse will result in bloat
export const runInCompatibilityMode = (options: {
  ivy: { callback: Function; args?: Array<any> };
  fallback: { callback: Function; args?: Array<any> };
}) => {
  let { callback, args } = isIvyVersion() ? options.ivy : options.fallback;
  return callback.apply(this, args || []);
};

export const appIsStable = stabilityObject => {
  return runInCompatibilityMode({
    ivy: {
      callback: () => {
        const app = ng.getComponent(getAllAngularRootElements()[0]);
        // Unsure if this is the correct way to get the tView that has App.template
        const appTemplateView = app.__ngContext__.debug.childHead.tView;
        originalTemplateFunction = originalTemplateFunction || appTemplateView.template;
        appTemplateView.template = (...args) => {
          originalTemplateFunction.apply(this, [...args]);
          ivySubject.next();
        };
        return ivySubject as Observable<null>;
      }
    },
    fallback: {
      callback: moduleParserHelperObject => {
        let appRef = parseModulesFromRootElement(
          moduleParserHelperObject.roots[0],
          moduleParserHelperObject.parsedModulesData
        );
        return appRef.isStable;
      },
      args: [stabilityObject]
    }
  });
};
