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
  static packets = (store) => _getState(store).packets;
}

export class Updaters {
  static addPacket
    = (packet: DiagPacket, state: DiagState): Array<DiagPacket> =>
      state.packets.concat(packet)
  static clear = () => INITIAL_STATE;
}
