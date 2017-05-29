declare const getAllAngularTestabilities: Function;
declare const getAllAngularRootElements: Function;
declare const ng: any;

export const isAngular = () => {
  return typeof getAllAngularTestabilities === 'function'
    && typeof getAllAngularRootElements === 'function';
};

export const isDebugMode = () => {
  if (typeof getAllAngularRootElements === 'function'
    && typeof ng !== 'undefined') {

    const rootElements = getAllAngularRootElements();
    const firstRootDebugElement = rootElements && rootElements.length ?
      ng.probe(rootElements[0]) : null;

    return firstRootDebugElement !== null
      && firstRootDebugElement !== void 0
      && firstRootDebugElement.injector;
  }
  return false;
};
