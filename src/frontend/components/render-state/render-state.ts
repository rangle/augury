import {Component, EventEmitter, Input} from 'angular2/core';
import StateValues from '../state-values/state-values';

@Component({
  selector: 'bt-render-state',
  templateUrl:
  '/src/frontend/components/render-state/render-state.html',
  directives: [RenderState, StateValues]
})
export default class RenderState {
  @Input() id: string;
  @Input() state: any;
  @Input() propertyTree: string;

  private expanded = {};

  expandTree(key, $event) {
    this.expanded[key] = !this.expanded[key];
    $event.preventDefault();
    $event.stopPropagation();
  }

  type(d: any): string {
    return typeof d;
  }

  keys(obj: any): any {
    return (obj instanceof Object) ? Object.keys(obj) : [];
  }
}
