// third party deps
import {Injectable} from '@angular/core';
import {dispatch} from '@angular-redux/store';

@Injectable()
export class DiagActions {
  static readonly LOGMSG = 'LOGMSG';
  static readonly LOGPKT = 'LOGPKT';
  static readonly CLEAR = 'CLEAR';

  @dispatch()
  logMsg = (entry) => ({
    type: DiagActions.LOGMSG,
    payload: entry,
  })

  @dispatch()
  logPacket = (entry) => ({
    type: DiagActions.LOGPKT,
    payload: entry,
  })

  @dispatch()
  clear = () => ({
    type: DiagActions.CLEAR
  })
}
