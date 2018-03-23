
declare const getAllAngularRootElements: () => Element[];

export const readNgVersion = () => {
  const rootElements = getAllAngularRootElements();
  if (rootElements && rootElements[0]) {
    return rootElements[0].getAttribute('ng-version');
  } else return null;
};
