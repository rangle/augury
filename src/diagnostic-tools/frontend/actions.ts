// third party deps
import {Injectable} from '@angular/core';
import {dispatch} from '@angular-redux/store';

// same-module deps
import { DiagPacket } from 'diagnostic-tools/shared';

export enum DiagActionType {
  TAKE_PKT,
  CLEAR,
  SHOW_PASSED,
}

@Injectable()
export class DiagActions {

  @dispatch()
  takePacket = (packet: DiagPacket) => ({
    type: DiagActionType.TAKE_PKT,
    payload: packet,
  })

  @dispatch()
  clear = () => ({
    type: DiagActionType.CLEAR
  })

  @dispatch()
  setShowPassed = (bool: boolean) => ({
    type: DiagActionType.SHOW_PASSED,
    payload: bool
  })
  // 
  // @dispatch()
  // importDiagnostic = (bool: boolean) => ({
  //   type: DiagActionType.SHOW_PASSED,
  //   payload: bool
  // })

}
