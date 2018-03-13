// third party deps
import { merge as m } from 'ramda';
import * as clone from 'clone';

// same-module deps
import { DiagPacket } from 'diagnostic-tools/shared';

export const NAMESPACE = 'diag';
const _getState = (store: any): DiagState => store[NAMESPACE];

interface PacketTreeNode { // @todo: or PacketFrame?
  packet: DiagPacket,
  children: Array<DiagPacket>
}

interface PacketTree {
  roots: Array<PacketTreeNode>
}

export interface DiagState {
  packets: Array<DiagPacket>; // @todo: get rid of this one?
  packetTree: PacketTree;
  presentationOptions: {
    showPassed: boolean
  };
}

export const INITIAL_STATE: DiagState = {
  packets: [],
  packetTree: {
    roots: []
  },
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
          .sort((a, b) => a.diagnostic.startTime - b.diagnostic.startTime),
        packetTree: insertPacketIntoTree(packet, state.packetTree) })
  static clear
    = (): DiagState => INITIAL_STATE
  static setShowPassed
    = (showPassed: Boolean, state: DiagState): DiagState =>
      m(state, {
        presentationOptions: m(state.presentationOptions, { showPassed }) })
}

const newFrame = (packet = null): PacketTreeNode => ({ //@todo: types types types
  children: [],
  packet,
})

// @todo: rewrite, make this not so mutaty (dont use foreach) code looks like hell
const insertPacketIntoTree = (packet, tree) => {
  const threadClone = clone(tree);
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
