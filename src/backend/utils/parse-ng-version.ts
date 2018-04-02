declare const getAllAngularRootElements: () => Element[];


export const parseNgVersion = () => {
  const rootElements = getAllAngularRootElements();
  if (rootElements && rootElements[0]) {
    return rootElements[0].getAttribute('ng-version');
  } else { return null; }
};
