import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
} from '@angular/core';
import StateValues from '../state-values/state-values';

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
  @Input() state: any;
  @Input() path: Array<string | number>;

  private expanded = {};

  private nest(key: string): boolean {
    return typeof this.state[key] === 'object';
  }

  expandTree(key, $event) {
    this.expanded[key] = !this.expanded[key];
    $event.preventDefault();
    $event.stopPropagation();
  }

  displayType(d: any): string {
    if (Array.isArray(d)) {
      return `Array[${d.length}]`;
    }
    else if (typeof d === 'object') {
      if (d) {
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
