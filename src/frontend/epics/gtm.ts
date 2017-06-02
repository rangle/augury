import {MainActions} from '../actions/main-actions';

export const gtmEpic = action$ =>
  action$.ofType(MainActions.DOM_SELECTION_ACTIVE_CHANGE)
         .filter(action => action.payload)
         .mapTo({
           type: 'SEND_ANALYTICS',
           payload: {
             event: 'auguryDOMSelection',
             desc: ''
           }
         });
