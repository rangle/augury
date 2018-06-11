import { Injectable } from '@angular/core';
import { dispatch } from '@angular-redux/store';

import { ChangeDetectionProfilerState } from './state.model'

export enum ChangeDetectionProfilerActionType {
  CDP_GENERIC_UPDATE = 'CDP_GENERIC_UPDATE', /* generic action that carries its own update function */
}

@Injectable()
export class ChangeDetectionProfilerActions {

  @dispatch()
  genericUpdate = (updater: (state: ChangeDetectionProfilerState ) => ChangeDetectionProfilerState ) => ({
    type: ChangeDetectionProfilerActionType.CDP_GENERIC_UPDATE,
    payload: { updater },
  })

}
