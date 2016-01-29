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

declare var ng: { probe: Function };


import { TreeNode, BaseAdapter } from './base';
import { DirectiveProvider } from 'angular2/src/core/linker/element';
import { DebugElement_ as DebugElement }
       from 'angular2/src/core/debug/debug_element';
// import { inspectNativeElement }
//   from 'angular2/src/core/debug/debug_element_view_listener';
import { Description } from '../utils/description';

export class Angular2Adapter extends BaseAdapter {
  _observer: MutationObserver;

  setup(): void {
    // only supports applications with single root for now
    const root = this._findRoot();
    this._traverseTree(ng.probe(root),
                       this._emitNativeElement,
                       true,
                       '0');
    this._trackChanges(root);
  }

  serializeComponent(el: DebugElement, event: string): TreeNode {
    const debugEl = el;
    const id = this._getComponentID(debugEl);
    const name = this._getComponentName(debugEl);
    const description = this._getDescription(debugEl);
    const state = this._normalizeState(name, this._getComponentState(debugEl));
    const input = this._getComponentInput(debugEl);
    const output = this._getComponentOutput(debugEl);
    const lastTickTime = this._getComponentPerf(debugEl);

    return {
      id,
      name,
      description,
      state,
      input,
      output,
      lastTickTime,
      __meta: {
        event
      }
    };
  }

  cleanup(): void {
    this._removeAllListeners();
    this.unsubscribe();
  }

  _findRoot(): Element {
    return document.body.querySelector('[data-ngid]');
  }

  _traverseTree(compEl: DebugElement, cb: Function, isRoot: boolean,
    idx: string): void {
    cb(compEl, isRoot, idx);

    const lightDOMChildren = this._getComponentNestedChildren(compEl);
    const rootChildren = this._getComponentChildren(compEl);

    if (!lightDOMChildren.length && !rootChildren.length) {
      return;
    }

    const children = lightDOMChildren.length && lightDOMChildren ||
                     rootChildren.length && rootChildren;

    children.forEach((child: DebugElement, childIdx: number) => {
      this._traverseTree(child,
                         cb,
                         false,
                         [idx, childIdx].join('.'));
    });
  }

  _emitNativeElement = (compEl: DebugElement, isRoot: boolean,
    idx: string): void => {
    const nativeElement = this._getNativeElement(compEl);

    // When encounter a template comment, insert another comment with
    // batarangle-id above it.
    if (nativeElement.nodeType === Node.COMMENT_NODE) {
      const commentNode = document.createComment(`{"batarangle-id": "${idx}"}`);
      if (!nativeElement.previousSibling.isEqualNode(commentNode)) {
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

  _trackChanges(el: Element): void {
    this._observer = new MutationObserver(this._handleChanges);

    this._observer.observe(el, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  _handleChanges = (mutations: MutationRecord[]): void => {
    this.reset();

    // Our handling of the change events will, in turn, cause DOM mutations
    // (e.g setting)
    this._observer.disconnect();

    const root = this._findRoot();
    this._traverseTree(ng.probe(root),
                       this._emitNativeElement,
                       true,
                       '0');
    this._trackChanges(root);
  };

  _getComponentChildren(compEl: DebugElement): DebugElement[] {
    return <DebugElement[]>compEl.componentViewChildren;
  }

  _getComponentNestedChildren(compEl: DebugElement): DebugElement[] {
    return <DebugElement[]>compEl.children;
  }

  _getNativeElement(compEl: DebugElement): Element {
    return compEl.nativeElement;
  }

  _removeAllListeners(): void {
    this._observer.disconnect();
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

  _getComponentInstance(compEl: DebugElement): Object {
    // fix could be undefined (are we grabbing the right element?)
    return compEl.componentInstance || {};
  }

  _getComponentRef(compEl: DebugElement): Element {
    return compEl.nativeElement;
  }

  _getComponentID(compEl: DebugElement): string {
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

  _getComponentName(compEl: DebugElement): string {
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

  _getComponentState(compEl: DebugElement): Object {
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

  _getComponentInput(compEl: DebugElement): Object {
    const props = {};
    // TODO: replace this logic with one that works
    // if (compEl._elementInjector) {
    //   const protoInjector = compEl._elementInjector._injector._proto;
    //   for (let i = 0; i < protoInjector.numberOfProviders; i++) {
    //     let provider = protoInjector.getProviderAtIndex(i);
    //     if (provider instanceof DirectiveProvider) {
    //       props[provider.displayName] = provider.metadata.events;
    //     }
    //   }
    // }
    return props;
  }

  _getComponentOutput(compEl: DebugElement): Object {
    const events = {};
    // TODO: replace this logic with one that works
    // if (compEl._elementInjector) {
    //   const protoInjector = compEl._elementInjector._injector._proto;
    //   for (let i = 0; i < protoInjector.numberOfProviders; i++) {
    //     let provider = protoInjector.getProviderAtIndex(i);
    //     if (provider instanceof DirectiveProvider) {
    //       events[provider.displayName] = provider.metadata.events;
    //     }
    //   }
    // }
    return events;
  }

  _getComponentPerf(compEl: DebugElement): number {
    return 0;
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
      // TODO: needs investigation on what this is/does
      // iterableDiffers: state._iterableDiffers,
      length: state._ngForOf.length,
      items: state._ngForOf
    };
  }

  _normalizeNgClass(state: any): Object {
    return {
      // TODO: needs investigation on what these are
      // iterableDiffers: state._iterableDiffers,
      // keyValueDiffers: state._keyValueDiffers,
      // differ: state._differ,
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
      // differ: state._differ
    };
  }

  _getDescription(compEl: DebugElement): Object[] {
    if (compEl.componentInstance) {
      return Description.getComponentDescription(compEl);
    } else {
      return [
        { key:'name', value: this._getComponentName(compEl) }
      ];
    }
  }
}
