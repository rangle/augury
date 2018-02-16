export const NAMESPACE = 'diag';
const _getState = (store) => store[NAMESPACE];

// @todo: needs type
export const INITIAL_STATE = {
  log: [{ txt: 'xxxxxx' }, { txt: 'zzzzz' }] // @todo: needs type
};

export const selectors = {
  log (store) {
    return _getState(store).log;
  }
};

export const updaters = {
  log: {
    add (entry, state) { // @todo: type
      return state.log.concat(entry);
    }
  }
};
