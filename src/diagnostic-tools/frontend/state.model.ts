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
      return state.log; // @todo: removing msgs to simplify structure. add these back
      // return state.log.concat({type: 'MSG', value: entry });
    },
    addPkt (entry, state) { // @todo: type
      return state.log.concat({type: 'PKT', value: entry })
        .sort((a, b) => { // @todo: shouldnt be sorting everything everytime
          if (a.type != 'PKT' || b.type != 'PKT') { return 0; }
          return (a.value.logicalThread.id < b.value.logicalThread.id) ? -1 : 1
        });
    }
  },
  clear () {
    return INITIAL_STATE;
  }
};
