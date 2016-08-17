/**
 * DOM Controller
 *
 * A controller runs within the application context and mediates between the
 * framework adapter and the developer tools.
 *
 * First, it is charged with setting up the backend. It does so by detecting
 * and instantiating the appropriate adapter given the version of the framework
 * on the page. Once done, it listens to events from the adapter and the
 * developer tools (front end) and mediates communication between the two.
 *
 * Communications occur over the channels.
 *
 * The DOM controller manages the backend mediation for the browser DOM.
 */

import { AdapterEventType as EventType } from '../adapters/event_types';
import { AdapterEvent } from '../adapters/base';
import { Angular2Adapter } from '../adapters/angular2';
import { BaseController } from './base';

import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

interface Sendable {
  sendMessage: Function;
}

export class DomController extends BaseController {
  private adapter: any;
  private channel: Sendable;
  private model: Array<any>;
  private callToRenderTree = new Subject<any>();

  static detectFramework(): Angular2Adapter {
    return new Angular2Adapter;
  }

  constructor(adapter: any, channel: Sendable) {
    super();

    this.model = [];
    this.adapter = adapter;
    this.channel = channel;

    this.callToRenderTree.debounceTime(0).subscribe(data => this.callFrontend(data));
  }

  callFrontend(data) {
    data.channel.sendMessage(data.message);
  }

  hookIntoBackend(): void {
    this.adapter.subscribe((e: AdapterEvent) => {
      this._onViewChange(e, this.channel);
    });
  }

  _onViewChange(evt: AdapterEvent, ch?: Sendable): void {
    switch (evt.type) {
      case EventType.ROOT:
        this._handleRootAdd(evt.node);
        break;
      case EventType.ADD:
        this._handleChildAdd(evt.node);
        break;
      case EventType.CHANGE:
        break;
      case EventType.REMOVE:
        break;
      case EventType.CLEAR:
        this._handleReset();
        break;
      case EventType.ROUTES:
        break;
      default:
        throw Error('Unknown adapter event.');
    }

    if (ch) {
      if (evt.type === EventType.ROUTES) {
        this.callToRenderTree.next({
          channel: ch,
          message: { type: 'render_routes', payload: evt.routes }
        });
      } else {
        this.callToRenderTree.next({
          channel: ch,
          message: { type: 'model_change', payload: this.model }
        });
      }
    }
  }

  _handleRootAdd(node: Node) {
    const rootNode = this.adapter.serializeComponent(node, EventType.ROOT);

    this.model.push(rootNode);
  }

  _handleChildAdd(node: Node) {
    const childNode = this.adapter.serializeComponent(node, EventType.ADD);
    const [rootIdx, ...childIdx] = childNode.id.split('.');
    const modelRoot = this.model[rootIdx];
    let modelChild = modelRoot;

    for (let index = 0; index < childIdx.length; index++) {
      let nextPath = childIdx[index];

      modelChild.children = modelChild.children || [];

      if (index === (childIdx.length - 1)) {
        modelChild.children[nextPath] = childNode;
        return;
      }

      modelChild = modelChild.children[nextPath] || {};
    }
  }

  _handleReset() {
    this.model = [];
  }
}
