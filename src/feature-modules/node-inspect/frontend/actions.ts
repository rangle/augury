import { Injectable } from '@angular/core';
import { dispatch } from '@angular-redux/store';

import { NodeInspectState } from './state.model'

export enum NodeInspectActionType {
  NI_GENERIC_UPDATE = 'NI_GENERIC_UPDATE', /* generic action that carries its own update function */
}

@Injectable()
export class NodeInspectActions {

  @dispatch()
  genericUpdate = (updater: (state: NodeInspectState ) => NodeInspectState ) => ({
    type: NodeInspectActionType.NI_GENERIC_UPDATE,
    payload: { updater },
  })

}
