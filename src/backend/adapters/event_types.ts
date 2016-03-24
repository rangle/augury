/**
 * Adapter Event Types
 *
 * An adapter hooks into the live application and broadcasts events related to
 * the state of the components (e.g. mount ops/locations,  state changes,
 * performance profile, etc...).
 *
 * For more information, see AdapterBase (./base.ts) or the Angular2 Adapater
 * (./angular2.ts).
 *
 * Upon initiation of the extension or whenever any changes occur, any of the
 * following events types may be broadcast:
 * - 'root': A new application root has been found. There can be multiple roots
 *           so this event can fire multiple times.
 * - 'root': A new root component has been added to the view.
 * - 'add': A new child component has been added to the view.
 * - 'change': A component in the view has changed.
 * - 'remove': A component has been removed from the view.
 * - 'clear': Reset component view.
 * - 'routes': Render router view
 */

export abstract class AdapterEventType {
  static ROOT: string = 'root';
  static ADD: string = 'add';
  static CHANGE: string = 'change';
  static REMOVE: string = 'remove';
  static CLEAR: string = 'clear';
  static ROUTES: string = 'routes';
}
