/**
 * Adapter for Angular2
 *
 * An adapter hooks into the live application and broadcasts events related to
 * the state of the components (e.g. mount ops/locations, state changes,
 * performance profile, etc...).
 *
 * For more information, see the Base Adapter (./base.ts).
 *
 * Interface:
 * - setup
 * - cleanup
 * - subscribe
 * - serializeComponent
 *
 */

declare var ng: { probe: Function, coreTokens: any };
declare var getAllAngularRootElements: Function;
declare var Reflect: { getOwnMetadata: Function };

import {
  ChangeDetectionStrategy,
  InputMetadata,
  OutputMetadata,
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { TreeNode, BaseAdapter } from './base';
import { Description } from '../utils/description';
import { ParseRouter, IS_OLD_ROUTER_HACK, parseConfigRoutes }
from '../utils/parse-router';

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

  _trackAngularChanges(rootNgProbe: any) {
    const ngZone = rootNgProbe.inject(ng.coreTokens.NgZone);
    ngZone.onStable.subscribe(() => this._onEventDone.next());
  }

  showAppRoutes(): void {
    const root = this._findRoot();
    try {
      const router = ng.probe(root).componentInstance.router;
      let routes: any;

      if (IS_OLD_ROUTER_HACK(router)) {
        // TODO: (ericjim): remove if-block and function
        // once we no longer support the old router.
        routes = ParseRouter.parseRoutes(router.root.registry);
      } else {
        routes = parseConfigRoutes(router);
      }

      this.showRoutes(routes);
    } catch (error) {
      console.log(error);
    }
  }

  _traverseElements(compEl: any, isRoot: boolean, idx: string, cb: Function) {

    if (compEl.providerTokens.length > 0) {
      this._tree[idx] = 0;
      cb(compEl, isRoot, idx);
    }

    if (compEl.children.length > 0) {
      compEl
      .children
      .filter((child: any) => !this._isComponentExcluded(child))
      .forEach((child: any, childIdx: number) => {
        let index: string = idx;
        if (child.providerTokens.length > 0) {
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

  _isComponent(debugEl: any): boolean {
    return debugEl.componentInstance !== null;
  }

  serializeComponent(el: any, event: string): TreeNode {
    const debugEl = el;
    const id = this._getComponentID(debugEl);
    const isComponent = this._isComponent(debugEl);
    const name = this._getComponentName(debugEl);
    const description = this._getDescription(debugEl);
    const state = this._normalizeState(name, this._getComponentState(debugEl));
    const input = this._getComponentInput(debugEl);
    const output = this._getComponentOutput(debugEl);
    const dependencies = this._getComponentDependencies(debugEl);
    const changeDetection = this._getComponentCD(debugEl);
    const injectors = this._getComponentInjectors(debugEl, dependencies);
    const directives = this._getComponentDirectives(debugEl);
    const providers = this._getProviders(debugEl);

    description.unshift({
      key: 'a-id',
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
      changeDetection,
      injectors,
      directives,
      isComponent,
      providers
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
    // augury-id above it.
    if (nativeElement.nodeType === Node.COMMENT_NODE) {
      const commentNode = document.createComment(`{"augury-id": "${idx}"}`);
      if (nativeElement.previousSibling === null
        || !nativeElement.previousSibling.isEqualNode(commentNode)) {
        nativeElement.parentNode.insertBefore(commentNode, nativeElement);
      }
    } else {
      (<HTMLElement>nativeElement).setAttribute('augury-id', idx);
    }
    if (isRoot) {
      return this.addRoot(compEl);
    } else {
      this.addChild(compEl);
    }
  };

  _getComponentInjectors(debugEl: any, dependencies: any) {

    const componentName = this._getComponentName(debugEl);
    const injectors = [];
    for (let i = 0; i < debugEl.providerTokens.length; i++) {
      const provider: any = debugEl.providerTokens[i];
      const name: string = this.getFunctionName(provider);
      injectors.push(name);
    }
   return injectors;
  }

  _getNativeElement(compEl: any): Element {
    return compEl.nativeElement;
  }

  _getComponentDirectives(debugEl: any) {
    const directives = [];

    if (debugEl.componentInstance) {
      const metadata = Reflect.getOwnMetadata
        ('annotations', debugEl.componentInstance.constructor);

      if (metadata && metadata.length > 0 && metadata[0].directives) {
        metadata[0].directives.forEach((directive) =>
          directives.push(this.getFunctionName(directive)));
      }
    }
    return directives;
  }

  _getComponentCD(debugEl: any) {
    let changeDetection;
    if (debugEl.componentInstance) {
      const metadata = Reflect.getOwnMetadata
        ('annotations', debugEl.componentInstance.constructor);
      if (metadata && metadata.length > 0) {
        changeDetection = ChangeDetectionStrategy[metadata[0].changeDetection];
      }
    }
    return changeDetection;
  }

  _getComponentDependencies(debugEl: any) {
    const dependencies = [];
    if (debugEl.componentInstance) {
      const parameters = Reflect.getOwnMetadata
        ('design:paramtypes', debugEl.componentInstance.constructor) || [];

      parameters.forEach((param) => {
        if (param) {
          dependencies.push(param.name);
        }
      });
    }

    return dependencies;
  }

  _getComponentInstance(compEl: any): Object {
    // fix could be undefined (are we grabbing the right element?)
    return compEl.componentInstance;
  }

  _getComponentRef(compEl: any): Element {
    return compEl.nativeElement;
  }

  _getComponentID(compEl: any): string {
    const nativeElement = this._getComponentRef(compEl);
    let id;
    if (nativeElement.nodeType !== Node.COMMENT_NODE) {
      id = nativeElement.getAttribute('augury-id');
    } else {
      const comment = JSON.parse((<any>nativeElement.previousSibling).data);
      id = comment['augury-id'];
    }
    return id;
  }

  _getComponentName(debugEl: any): string {
    let componentName;
    if (this._isComponent(debugEl)) {
      const constructor =  <any>this._getComponentInstance(debugEl)
        .constructor;
      componentName = constructor.name;
    } else {
      componentName = debugEl.name;
    }
    return componentName;
  }

  _isSerializable(val: any) {
    try {
      JSON.stringify(val);
    } catch (error) {
      return false;
    }

    return true;
  }

  _isComponentExcluded(debugEl: any): boolean {
    // skipping the option to improve performance
    // It adds no value displaying node elements
    return this._getComponentName(debugEl) === 'option';
  }

  _getComponentState(debugEl: any): Object {
    let state;
    if (debugEl.componentInstance) {
      state = {};
      const instance = this._getComponentInstance(debugEl);
      Object.keys(instance).forEach((key) => {
        const val = instance[key];

        if (!this._isSerializable(val)) {
          return;
        }

        state[key] = val;
      });
    }
    return state;
  }

  _getComponentInput(debugEl: any): Object[] {
    let inputs = [];
    if (debugEl.componentInstance) {
      // Get inputs from @Component({ inputs: [] })
      const metadata = Reflect.getOwnMetadata
        ('annotations', debugEl.componentInstance.constructor);

      inputs = (metadata && metadata.length > 0 && metadata[0].inputs) || [];

      // Get inputs from @Input()
      const propMetadata = Reflect.getOwnMetadata('propMetadata',
        debugEl.componentInstance.constructor);

      if (propMetadata) {
        for (const key of Object.keys(propMetadata)) {
          for (const meta of propMetadata[key]) {
            if (meta.constructor.name === (InputMetadata as any).name) {
              if (inputs.indexOf(key) < 0) { // avoid duplicates
                if (meta.bindingPropertyName) {
                  inputs.push(`${key}:${meta.bindingPropertyName}`);
                } else {
                  inputs.push(key);
                }
              }
            }
          }
        }
      }
    }

    return inputs;
  }

  _getComponentOutput(debugEl: any): Object {
    // Get outputs from @Component({ outputs })
    let outputs = [];
    if (debugEl.componentInstance) {
      const metadata = Reflect.getOwnMetadata
        ('annotations', debugEl.componentInstance.constructor);

      outputs = (metadata && metadata.length > 0 && metadata[0].outputs) || [];

      // Get outputs from @Output()
      const propMetadata = Reflect.getOwnMetadata('propMetadata',
        debugEl.componentInstance.constructor);

      if (propMetadata) {
        for (const key of Object.keys(propMetadata)) {
          for (const meta of propMetadata[key]) {
            if (meta.constructor.name === (OutputMetadata as any).name) {
              if (outputs.indexOf(key) < 0) { // avoid duplicates
                outputs.push(key);
              }
            }
          }
        }
      }
    }

    return outputs;
  }

  _normalizeState(name: string, state: Object): Object {
    switch (name) {
      case 'LoadNextToComponent':
        return {};
      case 'LoadAsRootComponent':
        return {};
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
      case 'RouterOutlet':
        return this._normalizeRouterOutlet(state);
      default:
        return state;
    }
  }

  _normalizeRouterOutlet(state: any): Object {
    return {
      name: state.name,
      currentInstruction: state._currentInstruction,
      activateEvents: state.activateEvents
    };
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
      mode: state._mode,
      initialClasses: state._initialClasses,
      rawClass: state._rawClass
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

  _getDescription(debugEl: any): Object[] {
      return Description.getComponentDescription(debugEl);
  }

  _getProviders(debugEl: any): Object[] {
    let providers = [];
    if (debugEl.providerTokens && debugEl.providerTokens.length > 0) {
      providers = debugEl.providerTokens.map((provider) => {
        return Description.getProviderDescription
          (provider, debugEl.injector.get(provider));
      });
    }

    if (debugEl.componentInstance) {
      const name = this._getComponentName(debugEl);
      providers = providers.filter((provider) => provider.key !== name);
    }

    return providers;
  }

  getFunctionName(value: string) {
    let name = value.toString();
    name = name.substr('function '.length);
    name = name.substr(0, name.indexOf('('));
    return name;
  }
}
