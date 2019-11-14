import { MainActions } from '../actions/main-actions';
import { mapTo, filter, map } from 'rxjs/operators';

const DOM_SELECTION_GTM = 'auguryDOMSelection';
const TAB_CHANGE_GTM = 'auguryTabChange';
const SUB_TAB_CHANGE_GTM = 'augurySubTabChange';
const EMIT_VALUE_GTM = 'auguryEmitValue';
const UPDATE_PROPERTY_GTM = 'auguryUpdateProperty';
const INITIALIZE_AUGURY_GTM = 'auguryInitialize';

const TAB_TYPES = [
  'Component Tree',
  'Router Tree',
  'NgModules',
];

const SUB_TAB_TYPES = [
  'Properties',
  'Injector Graph',
];

interface Action {
  payload?: any;
}

export const domSelectionGtmEpic = action$ =>
  action$.ofType(MainActions.DOM_SELECTION_ACTIVE_CHANGE).pipe(
    filter((action: Action) => action.payload),
    mapTo({
      type: MainActions.SEND_ANALYTICS,
      payload: {
        event: DOM_SELECTION_GTM,
        desc: 'DOM Selection Active'
      }
    })
  );

export const tabChangeGtmEpic = actions$ =>
  actions$.ofType(MainActions.SELECT_TAB).pipe(
    map((action: Action) => {
      return {
        type: MainActions.SEND_ANALYTICS,
        payload: {
          event: TAB_CHANGE_GTM,
          desc: TAB_TYPES[action.payload]
        }
      };
    }));

export const subTabChangeGtmEpic = actions$ =>
  actions$.ofType(MainActions.SELECT_COMPONENTS_SUB_TAB).pipe(
    map((action: Action) => {
      return {
        type: MainActions.SEND_ANALYTICS,
        payload: {
          event: SUB_TAB_CHANGE_GTM,
          desc: SUB_TAB_TYPES[action.payload]
        }
      };
    }));

export const emitValueGtmEpic = actions$ =>
  actions$.ofType(MainActions.EMIT_VALUE).pipe(
    mapTo({
      type: MainActions.SEND_ANALYTICS,
      payload: {
        event: EMIT_VALUE_GTM,
        desc: 'Emit Clicked'
      }
    }));

export const updatePropertyGtmEpic = actions$ =>
  actions$.ofType(MainActions.UPDATE_PROPERTY).pipe(
    mapTo({
      type: MainActions.SEND_ANALYTICS,
      payload: {
        event: UPDATE_PROPERTY_GTM,
        desc: 'Update property'
      }
    }));

export const initializeAuguryGtmEpic = actions$ =>
  actions$.ofType(MainActions.INITIALIZE_AUGURY).pipe(
    mapTo({
      type: MainActions.SEND_ANALYTICS,
      payload: {
        event: INITIALIZE_AUGURY_GTM,
        desc: 'Initialize Augury'
      }
    }));
