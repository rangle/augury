const observableProperties = ['isUnsubscribed', 'isStopped'];

export const isObservable = object => {
  if (object == null) {
    return false;
  }

  return observableProperties.every(k => object.hasOwnProperty(k));
};

export const isSubject = object => {
  return isObservable(object) && object.hasOwnProperty('hasError');
};

export const isLargeArray = object => {
  if (Array.isArray(object) === false) {
    return false;
  }
  return object.length > 100;
};
