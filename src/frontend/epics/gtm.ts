import {MainActions} from '../actions/main-actions';

const DOM_SELECTION_GTM = 'auguryDOMSelection';
const TAB_CHANGE_GTM = 'auguryTabChange';
const SUB_TAB_CHANGE_GTM = 'augurySubTabChange';

const TAB_TYPES = [
  'Component Tree',
  'Router Tree',
  'NgModules',
];

const SUB_TAB_TYPES = [
  'Properties',
  'Injector Graph',
];


export const domSelectionGtmEpic = action$ =>
  action$.ofType(MainActions.DOM_SELECTION_ACTIVE_CHANGE)
         .filter(action => action.payload)
         .mapTo({
           type: MainActions.SEND_ANALYTICS,
           payload: {
             event: DOM_SELECTION_GTM,
             desc: 'DOM Selection Active'
           }
         });

export const tabChangeGtmEpic = actions$ =>
  actions$.ofType(MainActions.SELECT_TAB)
          .map(action => {
            return {
              type: MainActions.SEND_ANALYTICS,
              payload: {
                event: TAB_CHANGE_GTM,
                desc: TAB_TYPES[action.payload]
              }
            };
          });

export const subTabChangeGtmEpic = actions$ =>
  actions$.ofType(MainActions.SELECT_COMPONENTS_SUB_TAB)
    .map(action => {
      return {
        type: MainActions.SEND_ANALYTICS,
        payload: {
          event: SUB_TAB_CHANGE_GTM,
          desc: SUB_TAB_TYPES[action.payload]
        }
      };
    });
