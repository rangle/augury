import {Injectable} from '@angular/core';
import {dispatch} from '@angular-redux/store';

@Injectable()
export class DiagActions {
  static readonly LOG = 'LOG';

  @dispatch()
  log = (entry) => ({
    type: DiagActions.LOG,
    payload: entry,
  })

}
