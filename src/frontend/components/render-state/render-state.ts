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

import {
  ComponentPropertyState,
  ExpandState,
} from '../../state';

import {deserializePath} from '../../../tree';

enum StateClassification {
  Input,
  Output,
  Property,
}

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
  @Input() level: number;
  @Input() path: Array<string | number>;
  @Input() state;

  private StateClassification = StateClassification;

  private EmitState = EmitState;

  private emitState = new Map<string, EmitState>();

  constructor(
    private userActions: UserActions,
    private propertyState: ComponentPropertyState
  ) {}

  keys(obj): string[] {
    return (obj instanceof Object) ? Object.keys(obj) : [];
  }

  expandTree(key) {
    switch (this.classification(key)) {
      case StateClassification.Input:
      case StateClassification.Property:
        this.propertyState.toggleExpand(this.path.concat([key]));
        break;
    }
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

  private classification(key: string): StateClassification {
    if (this.level === 0) {
      if (this.inputs.hasOwnProperty(key)) {
        return StateClassification.Input;
      }
      else if (this.outputs.hasOwnProperty(key)) {
        return StateClassification.Output;
      }
    }
    return StateClassification.Property;
  }

  private displayType(d): string {
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

  private evaluate(data: string) {
    try {
      return (new Function(`return ${data}`))();
    }
    catch (e) {
      return data;
    }
  }

  private emitValue(outputProperty: string, data) {
    data = this.evaluate(data);

    const update = (state: EmitState) => this.emitState.set(outputProperty, state);

    const timedReset = () => setTimeout(() => update(EmitState.None), 3000);

    const path = deserializePath(this.id).concat([outputProperty]);

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
