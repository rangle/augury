// third party deps
import { merge } from 'ramda';

// same-module deps
import { DiagPacket } from 'diagnostic-tools/shared';

export const NAMESPACE = 'diag';
const _getState = (store: any): DiagState => store[NAMESPACE];

export interface DiagState {
  packets: Array<DiagPacket>;
}

export const INITIAL_STATE: DiagState = {
  packets: []
};

export class Selectors {
  static packets
    = (store) => _getState(store).packets
}

export class Updaters {
  static addPacket
    = (packet: DiagPacket, state: DiagState): DiagState =>
      merge(state, {
        packets: state.packets
          .concat(packet)
          .sort((a, b) => a.diagnostic.startTime - b.diagnostic.startTime) })
  static clear
    = (): DiagState => INITIAL_STATE
}
