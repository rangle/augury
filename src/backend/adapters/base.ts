/**
 * Base Adapter
 *
 * An adapter hooks into the live application and broadcasts events related to
 * the state of the components (e.g. mount ops/locations, state changes,
 * performance profile, etc...).
 *
 * For more information, see the Angular2 Adapter (./angular2.ts).
 *
 * The adapter works in two phases:
 * 1) Setup phase: The initial bootstrap of the extension. After angular
 *                 bootstraps and the DOM content has loaded, we walk the DOM
 *                 tree once and broadcast the addition of the initial
 *                 components into the view.
 * 2) Tracking phase: After setup, we listen to changes in the application and
 *                    broadcast component changes and removal as well as new
 *                    additions into the view after the initial load.
 *
 * Interface:
 * - addRoot
 * - addChild
 * - changeComponent
 * - removeRoot
 * - removeChild
 *
 * These broadcasts are sent to the controller, see the DOM controller
 * (../controller/dom.ts).
 */

import {Subject} from 'rxjs';
import { AdapterEventType as EventType } from './event_types';

export interface AdapterEvent {
  type: string;
  node?: Node;
  routes?: string;
}

export interface TreeNode {
  id: string;
  name: string;
  description: Object[];
  state: Object;
  input: Object;
  output: Object;
  isSelected: boolean;
  isOpen: boolean;
  dependencies: any;
  changeDetection: any;
  injectors: any;
  directives: any;
  isComponent: boolean;
  isFrameworkComponent: boolean;
  providers: Object[];
}

export abstract class BaseAdapter {
  private _stream: Subject<any> = new Subject();

  showRoutes(routes: any): void {
    const routesEvt: AdapterEvent = {
      type: EventType.ROUTES,
      routes: routes
    };

    this._stream.next(routesEvt);
  }

  addRoot(rootEl: any): void {
    const rootEvt: AdapterEvent = {
      type: EventType.ROOT,
      node: rootEl
    };

    this._stream.next(rootEvt);
  }

  addChild(childEl: any): void {
    const childEvt: AdapterEvent = {
      type: EventType.ADD,
      node: childEl
    };

    this._stream.next(childEvt);
  }

  changeComponent(el: any): void {
    const childEvt: AdapterEvent = {
      type: EventType.CHANGE,
      node: el
    };

    this._stream.next(childEvt);
  }

  removeRoot(el: any): void {
    const rootEvt: AdapterEvent = {
      type: EventType.REMOVE,
      node: el
    };

    this._stream.next(rootEvt);
  }

  removeChild(el: any): void {
    const childEvt: AdapterEvent = {
      type: EventType.REMOVE,
      node: el
    };

    this._stream.next(childEvt);
  }

  reset(): void {
    const evt: AdapterEvent = {
      type: EventType.CLEAR
    };

    this._stream.next(evt);
  }

  subscribe(next?: Function, err?: Function, done?: Function): void {
    this._stream.subscribe.call(this._stream, next, err, done);
  }

  unsubscribe() {
    this._stream.complete();
  }

  abstract setup(): void;

  abstract serializeComponent(el: any, event: string): TreeNode;

}
