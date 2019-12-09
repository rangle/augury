declare const getAllAngularTestabilities: Function;
declare const getAllAngularRootElements: Function;
declare const ngCore: any;

export const isAngular = () => {
  return typeof getAllAngularTestabilities === 'function' && typeof getAllAngularRootElements === 'function';
};

export const isDebugMode = () => {
  if (typeof getAllAngularRootElements === 'function' && typeof ngCore !== 'undefined') {
    const rootElements = getAllAngularRootElements();
    const firstRootDebugElement = rootElements && rootElements.length ? ngCore.getDebugNode(rootElements[0]) : null;

    return firstRootDebugElement !== null && firstRootDebugElement !== void 0 && firstRootDebugElement.injector;
  }
  return false;
};
