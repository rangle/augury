declare const getAllAngularTestabilities: Function;
declare const getAllAngularRootElements: Function;
declare const ng: any;

export const isAngular = () => {
  return typeof getAllAngularTestabilities === 'function'
    && typeof getAllAngularRootElements === 'function'
    && typeof ng !== 'undefined';
};

export const isDebugMode = () => {
  return typeof getAllAngularRootElements === 'function'
    && typeof ng !== 'undefined'
    && ng.probe(getAllAngularRootElements()[0]) !== null;
};
