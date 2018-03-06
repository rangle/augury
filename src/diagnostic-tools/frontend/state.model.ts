// third party deps
import { merge as m } from 'ramda';

// same-module deps
import { DiagPacket } from 'diagnostic-tools/shared';

export const NAMESPACE = 'diag';
const _getState = (store: any): DiagState => store[NAMESPACE];

export interface DiagState {
  packets: Array<DiagPacket>;
  presentationOptions: {
    showPassed: boolean
  };
}

export const INITIAL_STATE: DiagState = {
  packets: [],
  presentationOptions: {
    showPassed: false
  }
};

export class Selectors {
  static packets
    = (store) => _getState(store).packets
  static presentationOptions
    = (store) => _getState(store).presentationOptions
}

export class Updaters {
  static addPacket
    = (packet: DiagPacket, state: DiagState): DiagState =>
      m(state, {
        packets: state.packets
          .concat(packet)
          .sort((a, b) => a.diagnostic.startTime - b.diagnostic.startTime) })
  static clear
    = (): DiagState => INITIAL_STATE
  static setShowPassed
    = (showPassed: Boolean, state: DiagState): DiagState =>
      m(state, {
        presentationOptions: m(state.presentationOptions, { showPassed }) })
}
