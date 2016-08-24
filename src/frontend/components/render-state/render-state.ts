import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
} from '@angular/core';

import StateValues from '../state-values/state-values';

import {
  isObservable,
  isSubject,
} from '../../utils';

const defaultExpansionDepth = 1;

@Component({
  selector: 'bt-render-state',
  template: require('./render-state.html'),
  directives: [
    RenderState,
    StateValues,
  ],
})
export default class RenderState {
  @Input() id: string;
  @Input() path: Array<string | number>;
  @Input() level: number;
  @Input() state;

  private expansionState = {};

  private get none() {
    return this.state == null || Object.keys(this.state).length === 0;
  }

  private nest(key: string): boolean {
    return typeof this.state[key] === 'object';
  }

  private expanded(key: string): boolean {
    if (this.expansionState.hasOwnProperty(key)) {
      return this.expansionState[key];
    }
    if (isObservable(this.state[key])) { // do not expand observables (default)
      return false;
    }
    return this.level <= defaultExpansionDepth; // default depth
  }

  expandTree(key, $event) {
    this.expansionState[key] = !this.expansionState[key];

    $event.preventDefault();
    $event.stopPropagation();
  }

  displayType(d: any): string {
    if (Array.isArray(d)) {
      return `Array[${d.length}]`;
    }
    else if (typeof d === 'object') {
      if (d) {
        if (isSubject(d)) {
          return 'Subject';
        }
        else if (isObservable(d)) {
          return 'Observable';
        }
        return 'Object';
      } else if (d === null) {
        return 'null';
      } else if (d === undefined) {
        return 'undefined';
      }
    }
    return typeof d;
  }

  keys(obj): string[] {
    return (obj instanceof Object) ? Object.keys(obj) : [];
  }
}
