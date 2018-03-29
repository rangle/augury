//@todo: again, splitting up backend/frontend so that frontendfiles dont try to boot AngularReader (and fail at "getAllAngularRootElements")
//       actual isomorphic code should exist in 'shared'

export const isDebugElementComponent = (element) => !!element.componentInstance &&
  !componentInstanceExistsInParentChain(element);

export const componentInstanceExistsInParentChain = (debugElement) => {
  const componentInstanceRef = debugElement.componentInstance;
  while (componentInstanceRef && debugElement.parent) {
    if (componentInstanceRef === debugElement.parent.componentInstance) {
      return true;
    }
    debugElement = debugElement.parent;
  }
  return false;
};
