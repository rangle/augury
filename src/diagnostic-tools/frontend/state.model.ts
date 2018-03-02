export const NAMESPACE = 'diag';
const _getState = (store) => store[NAMESPACE];

import * as clone from 'clone';

// @todo: needs type
export const INITIAL_STATE = {
  // log: [], // @todo: trying out different structure. keeping this as backup // @todo: needs type (msg/packet)
  log: {} // @todo: rename as "logicalThreads" or "tree" or whatever
};

export const selectors = {
  log (store) {
    return _getState(store).log;
  }
};

const newFrame = (packet = null) => ({ //@todo: types types types
  children: [],
  packet,
})

// @todo: rewrite, make this not so mutaty (dont use foreach) code looks like hell
const insertPacketIntoTree = (packet, thread = newFrame()) => {
  const threadClone = clone(thread);
  let frameCursor = threadClone;
  packet.logicalThread.stackTreePosition.forEach(i => {
    const arrOfNewLength = (new Array(Math.max(i + 1, frameCursor.children.length))).fill(true).map(_ => newFrame());
    frameCursor.children.forEach((_,j) => arrOfNewLength[j] = frameCursor.children[j]);
    frameCursor.children = arrOfNewLength;
    frameCursor = frameCursor.children[i];
  });
  // @todo: rewrite into nicer way of inserting new frame when we reach the correct spot
  frameCursor.packet = packet;
  return threadClone;
}

export const updaters = {
  log: {
    addMsg (entry, state) { // @todo: type
      return state.log; // @todo: removing msgs to simplify structure. add these back
      // return state.log.concat({type: 'MSG', value: entry });
    },
    addPkt (entry, state) { // @todo: type
      return Object.assign(
        {},
        state.log,
        { [entry.logicalThread.id]: insertPacketIntoTree(entry, state.log[entry.logicalThread.id]) }
      );
/*
      // @todo: trying out different structure. keeping this as backup
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
