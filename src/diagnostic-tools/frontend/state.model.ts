export const NAMESPACE = 'diag';
const _getState = (store) => store[NAMESPACE];

// @todo: needs type
export const INITIAL_STATE = {
  log: [] // @todo: needs type (msg/packet)
};

export const selectors = {
  log (store) {
    return _getState(store).log;
  }
};

export const updaters = {
  log: {
    addMsg (entry, state) { // @todo: type
      return state.log.concat({type: 'MSG', value: entry });
    },
    addPkt (entry, state) { // @todo: type
      return state.log.concat({type: 'PKT', value: entry });
    }
  },
  clear () {
    return INITIAL_STATE;
  }
};
