export const NAMESPACE = 'diag';
const _getState = (store) => store[NAMESPACE];

// @todo: needs type
export const INITIAL_STATE = {
  // log: [], // @todo: trying out different structure. keeping this as backup // @todo: needs type (msg/packet)
  log: {} // @todo: rename as "logicalThreads"
};

export const selectors = {
  log (store) {
    return _getState(store).log;
  }
};

const asFrame = (packet) => ({ //@todo: types types types
  children
})

const newThread = (fame) => ({
    siblings: [],
});

const insertFrameIntoThread = (frame, thread = newThread(frame)) => {

}

export const updaters = {
  log: {
    addMsg (entry, state) { // @todo: type
      return state.log; // @todo: removing msgs to simplify structure. add these back
      // return state.log.concat({type: 'MSG', value: entry });
    },
    addPkt (entry, state) { // @todo: type
      const typedEntry = {type: 'PKT', value: entry};
      if (state.log[entry.logicalThread.id]) {

      } else {
        state.log[entry.logicalThread.id] =
      }
      /* // @todo: trying out different structure. keeping this as backup
      return state.log.concat({type: 'PKT', value: entry })
        .sort((a, b) => { // @todo: shouldnt be sorting everything everytime
          if (a.type != 'PKT' || b.type != 'PKT') { return 0; }
          return (a.value.logicalThread.id < b.value.logicalThread.id) ? -1 : 1
        });
        */
    }
  },
  clear () {
    return INITIAL_STATE;
  }
};
