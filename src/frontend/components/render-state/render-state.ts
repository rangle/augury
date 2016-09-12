import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
} from '@angular/core';

import {UserActions} from '../../actions/user-actions/user-actions';

import {
  InputOutput,
  isObservable,
  isSubject,
  isLargeArray,
} from '../../utils';

import {getPropertyPath} from '../../../backend/utils';

import {
  ComponentPropertyState,
  ExpandState,
} from '../../state';

import {
  Metadata,
  Path,
  PropertyMetadata,
  deserializePath,
  serializePath,
} from '../../../tree';

export enum EmitState {
  None,
  Emitted,
  Failed,
}

@Component({
  selector: 'bt-render-state',
  template: require('./render-state.html'),
  styles: [require('to-string!./render-state.css')],
})
export class RenderState {
  @Input() id: string;
  @Input() inputs: InputOutput;
  @Input() outputs: InputOutput;
  @Input() metadata: Metadata;
  @Input() level: number;
  @Input() path: Array<string | number>;
  @Input() state;

  private EmitState = EmitState;

  private emitState = new Map<string, EmitState>();

  private PropertyMetadata = PropertyMetadata;

  constructor(
    private userActions: UserActions,
    private propertyState: ComponentPropertyState
  ) {}

  keys(obj): string[] {
    return (obj instanceof Object) ? Object.keys(obj) : [];
  }

  expandTree(key: string) {
    if (this.expandable(key)) {
      this.propertyState.toggleExpand(this.path.concat([key]));
    }
  }

  private metadataForKey(key: string): PropertyMetadata {
    const propertyPath = getPropertyPath(this.path).concat([key]);

    return this.metadata.get(this.state[key]);
  }

  private has(key: string, flag: PropertyMetadata) {
    const propertyPath = getPropertyPath(this.path).concat([key]);

    return (this.metadataForKey(serializePath(propertyPath)) & flag) === flag;
  }

  private get none() {
    return this.state == null || Object.keys(this.state).length === 0;
  }

  private nest(key: string): boolean {
    return typeof this.state[key] === 'object' && this.state[key] != null;
  }

  private expanded(key: string): boolean {
    return this.propertyState.expansionState(this.path.concat([key])) === ExpandState.Expanded;
  }

  private displayType(key: string): string {
    const object = this.state[key];

    if (Array.isArray(object)) {
      return `Array[${object.length}]`;
    }
    else if (object != null) {
      if ((this.metadataForKey(key) & PropertyMetadata.Observable) !== 0) {
        return 'Observable';
      }
      else if (Object.keys(object).length === 0) {
        return '{}';
      }
      return 'Object';
    }

    if (object === null) {
      return 'null';
    }
    else if (object === undefined) {
      return 'undefined';
    }
  }

  private expandable(key: string) {
    return this.isEmittable(key) === false && Object.keys(this.state[key]).length > 0;
  }

  private evaluate(data: string) {
    try {
      return (new Function(`return ${data}`))();
    }
    catch (e) {
      return data;
    }
  }

  private isEmittable(key: string): boolean {
    const flags = this.metadataForKey(key);

    return (flags & PropertyMetadata.EventEmitter) !== 0
        || (flags & PropertyMetadata.Subject) !== 0;
  }

  private emitValue(outputProperty: string, data) {
    data = this.evaluate(data);

    const update = (state: EmitState) => this.emitState.set(outputProperty, state);

    const timedReset = () => setTimeout(() => update(EmitState.None), 3000);

    const path = this.path.concat([outputProperty]);

    return this.userActions.emitValue(path, data)
      .then(() => {
        update(EmitState.Emitted);
        timedReset();
      })
      .catch(error => {
        update(EmitState.Failed);
        timedReset();
      });
  }
}
