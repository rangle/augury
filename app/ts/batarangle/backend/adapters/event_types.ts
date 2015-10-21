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
 * - 'add': A new child component has been added to the view.
 * - 'change': A component in the view has changed.
 * - 'remove': A component has been removed from the view.
 * - 'clear': Reset component view.
 */

enum _AdapterEventType {
  ROOT,
  ADD,
  CHANGE,
  REMOVE,
  CLEAR,
}

// TSFIXME(bertrandk): There doesn't seem to be much better ways of creating
// string-based enums until https://github.com/Microsoft/TypeScript/issues/1003
// lands with TypeScript 1.8
export class AdapterEventType {
  Events: { [s: string]: string };
  // TSFIXME(bertrandk): Not really private in JS but inaccesible in TypeScript
  // at least. Since it's not spec compliant to begin with (see section 8.2.1),
  // we could find another way. Accessing an enum value by string is also a bit
  // of a pain.
  private static _get(key:  string): string {
    const type: number = (<any>_AdapterEventType)[key];

    return _AdapterEventType[type].toLowerCase();
  }

  static get ROOT(): string {
    return AdapterEventType._get('ROOT');
  }

  static get ADD(): string {
    return AdapterEventType._get('ADD');
  }

  static get CHANGE(): string {
    return AdapterEventType._get('CHANGE');
  }

  static get REMOVE(): string {
    return AdapterEventType._get('REMOVE');
  }

  static get CLEAR(): string {
    return AdapterEventType._get('CLEAR');
  }
}
