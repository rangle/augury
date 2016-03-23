/**
 * Adapter for Angular2
 *
 * An adapter hooks into the live application and broadcasts events related to
 * the state of the components (e.g. mount ops/locations, state changes,
 * performance profile, etc...).
 *
 * For more information, see the Base Adapater (./base.ts).
 *
 * NOTE: This is (definitely) a work in progress. Currently, for the adapter to
 *       function properly, the root of the application must be bound to a
 *       DebugElementViewListener.
 *
 * We infer the root element of our application by finding the first DOM element
 * with an `ngid` attribute (put there by DebugElementViewListener). Component
 * events are indicated by DOM mutations.
 *
 * Interface:
 * - setup
 * - cleanup
 * - subscribe
 * - serializeComponent
 *
 * Supports up to 2.0.0-beta-1
 */

declare var ng: { probe: Function, coreTokens: any };
declare var getAllAngularRootElements: Function;
declare var Reflect: { getOwnMetadata: Function };

import { TreeNode, BaseAdapter } from './base';
import { DirectiveProvider } from 'angular2/src/core/linker/element';
import { Description } from '../utils/description';
import { ParseRouter } from '../utils/parse-router';

import {DirectiveResolver} from '../directive-resolver';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

import {ChangeDetectionStrategy} from 'angular2/core';

export class Angular2Adapter extends BaseAdapter {
  _tree: any = {};
  _onEventDone: any;

  constructor() {
    super();
    this._onEventDone = new Subject();

    this._onEventDone
      .debounce((x) => Observable.timer(250))
      .subscribe(this.renderTree.bind(this));
  }

  renderTree() {
    this.reset();
    const root = this._findRoot();
    this._tree = {};
    this._traverseElements(ng.probe(root),
      true,
      '0',
      this._emitNativeElement);
  }

  setup(): void {
    // only supports applications with single root for now
    const root = this._findRoot();
    this._tree = {};
    this._traverseElements(ng.probe(root),
      true,
      '0',
      this._emitNativeElement);

    this._trackAngularChanges(ng.probe(root));
  }

  showAppRoutes(): void {
    const root = this._findRoot();
    try {
      const routes = ParseRouter.parseRoutes(
        ng.probe(root).componentInstance.router.root.registry);

      this.showRoutes(routes);
    } catch (error) {
      console.log(error);
    }
  }

  _trackAngularChanges(rootNgProbe: any) {
    const ngZone = rootNgProbe.inject(ng.coreTokens.NgZone);
    ngZone.onStable.subscribe(() => this._onEventDone.next());
  }

  _traverseElements(compEl: any, isRoot: boolean, idx: string, cb: Function) {

    if (compEl.componentInstance) {
      this._tree[idx] = 0;
      cb(compEl, isRoot, idx);
    }

    if (compEl.children.length > 0) {
      compEl
      .children
      .forEach((child: any, childIdx: number) => {

        let index: string = idx;
        if (child.componentInstance) {
          index = [idx, this._tree[idx]].join('.');
          this._tree[idx]++;
        }

        this._traverseElements(child,
          false,
          index,
          cb);
      });

    }
  }

  getClassName(type: any): boolean {
    return type.constructor.toString().match(/\w+/g)[1] === 'DebugElement';
  }

  serializeComponent(el: any, event: string): TreeNode {
    const debugEl = el;
    const id = this._getComponentID(debugEl);
    const name = this._getComponentName(debugEl);
    const description = this._getDescription(debugEl);
    const state = this._normalizeState(name, this._getComponentState(debugEl));
    const input = this._getComponentInput(debugEl);
    const output = this._getComponentOutput(debugEl);
    const dependencies = this._getComponentDependencies(debugEl);
    const injectors = this._getComponentInjectors(debugEl, dependencies);
    const changeDetection = this._getComponentCD(debugEl);

    description.unshift({
      key: 'b-id',
      value: id
    });

    return {
      id,
      name,
      description,
      state,
      input,
      output,
      isSelected: false,
      isOpen: true,
      dependencies,
      injectors,
      changeDetection
    };
  }

  _findRoot(): Element {
    const ngRootEl = getAllAngularRootElements()[0];

    if (ngRootEl) {
      return ngRootEl;
    }

    throw new Error('Not able to find root node');
  }

  _emitNativeElement = (compEl: any, isRoot: boolean,
    idx: string): void => {
    const nativeElement = this._getNativeElement(compEl);

    // When encounter a template comment, insert another comment with
    // batarangle-id above it.
    if (nativeElement.nodeType === Node.COMMENT_NODE) {
      const commentNode = document.createComment(`{"batarangle-id": "${idx}"}`);
      if (nativeElement.previousSibling === null
        || !nativeElement.previousSibling.isEqualNode(commentNode)) {
        nativeElement.parentNode.insertBefore(commentNode, nativeElement);
      }
    } else {
      (<HTMLElement>nativeElement).setAttribute('batarangle-id', idx);
    }

    if (isRoot) {
      return this.addRoot(compEl);
    }

    this.addChild(compEl);
  };


  _getComponentChildren(compEl: any): any[] {
    return <any[]>compEl.componentViewChildren;
  }

  _getComponentNestedChildren(compEl: any): any[] {
    return <any[]>compEl.children;
  }

  _getNativeElement(compEl: any): Element {
    return compEl.nativeElement;
  }

  _selectorMatches(el: Element, selector: string): boolean {
    function genericMatch(s: string): boolean {
      return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
    }

    const p = <any>Element.prototype;
    const f = p.matches ||
              p.webkitMatchesSelector ||
              p.mozMatchesSelector ||
              p.msMatchesSelector ||
              genericMatch;

    return f.call(el, selector);
  }

  _getComponentCD(compEl: any) {
    let changeDetection;
    const metadata = Reflect.getOwnMetadata('annotations',
      compEl.componentInstance.constructor);
    if (metadata && metadata.length > 0) {
      changeDetection = metadata[0].changeDetection;
    }
    return ChangeDetectionStrategy[changeDetection];
  }

  _getComponentDependencies(compEl: any) {

    const dependencies = [];
    const parameters = Reflect.getOwnMetadata('design:paramtypes',
      compEl.componentInstance.constructor);

    parameters.forEach((param) => dependencies.push(param.name));

    return dependencies;
  }

  _getComponentInjectors(compEl: any, dependencies: any) {

    const componentName = this._getComponentName(compEl);
    const injectors = [];
    for (let i = 0; i < compEl.providerTokens.length; i++) {
      const provider: any = compEl.providerTokens[i];
      const name: string = this.getFunctionName(provider);
      // if (name !== componentName) {
      injectors.push(name);
      // }
    }
   return injectors;
  }

  _getComponentInstance(compEl: any): Object {
    // fix could be undefined (are we grabbing the right element?)
    return compEl.componentInstance || {};
  }

  _getComponentRef(compEl: any): Element {
    return compEl.nativeElement;
  }

  _getComponentID(compEl: any): string {
    const nativeElement = this._getComponentRef(compEl);
    let id;
    if (nativeElement.nodeType !== Node.COMMENT_NODE) {
      id = nativeElement.getAttribute('batarangle-id');
    } else {
      const comment = JSON.parse((<any>nativeElement.previousSibling).data);
      id = comment['batarangle-id'];
    }
    return id;
  }

  _getComponentName(compEl: any): string {
    const constructor =  <any>this._getComponentInstance(compEl)
                                  .constructor;
    const constructorName = constructor.name;

    // Cover components not backed by a custom class.
    return constructorName !== 'Object' ?
           constructorName :
           this._getComponentRef(compEl).tagName;
  }

  _isSerializable(val: any) {
    try {
      JSON.stringify(val);
    } catch (error) {
      return false;
    }

    return true;
  }

  _getComponentState(compEl: any): Object {
    const ret = {};
    const instance = this._getComponentInstance(compEl);

    Object.keys(instance).forEach((key) => {
      const val = instance[key];

      if (!this._isSerializable(val)) {
        return;
      }

      ret[key] = val;
    });

    return ret;
  }

  _getComponentInput(compEl: any): Object {
    const metadata = Reflect.getOwnMetadata('annotations',
      compEl.componentInstance.constructor);

    return (metadata && metadata.length > 0) ?
      metadata[0].inputs : [];
  }

  _getComponentOutput(compEl: any): Object {
    const metadata = Reflect.getOwnMetadata('annotations',
      compEl.componentInstance.constructor);

    return (metadata && metadata.length > 0) ?
      metadata[0].outputs : [];
  }

  _normalizeState(name: string, state: Object): Object {
    switch (name) {
      case 'NgFor':
        return this._normalizeNgFor(state);
      case 'NgIf':
        return this._normalizeNgIf(state);
      case 'NgClass':
        return this._normalizeNgClass(state);
      case 'NgSwitch':
        return this._normalizeNgSwitch(state);
      case 'NgStyle':
        return this._normalizeNgStyle(state);
      default:
        return state;
    }
  }

  _normalizeNgIf(state: any): Object {
    return {
      condition: state._prevCondition
    };
  }

  _normalizeNgFor(state: any): Object {
    return {
      length: state._ngForOf.length,
      items: state._ngForOf
    };
  }

  _normalizeNgClass(state: any): Object {
    return {
      evaluationMode: state._mode,
      initialClasses: state._initialClasses,
      evaluatedClasses: state._rawClass
    };
  }

  _normalizeNgSwitch(state: any): Object {
    return {
      activeViews: state._activeViews,
      switchValue: state._switchValue,
      useDefault: state._useDefault,
      views: state._valueViews
    };
  }

  _normalizeNgStyle(state: any): Object {
    return {
      styles: state._rawStyle
    };
  }

  _getDescription(compEl: any): Object[] {
    if (compEl.componentInstance) {
      return Description.getComponentDescription(compEl);
    } else {
      return [
        { key: 'name', value: this._getComponentName(compEl) }
      ];
    }
  }

  getFunctionName(value: string) {
    let name = value.toString();
    name = name.substr('function '.length);
    name = name.substr(0, name.indexOf('('));
    return name;
  }
}
