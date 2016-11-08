import md5 = require('md5');

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
} from '@angular/core';

import {UserActions} from '../../actions/user-actions/user-actions';

import {
  isObservable,
  isSubject,
  isLargeArray,
} from '../../utils';

import {getPropertyPath} from '../../../backend/utils';

import {functionName} from '../../../utils';

import {
  ComponentPropertyState,
  ExpandState,
} from '../../state';

import {
  Metadata,
  Path,
  ObjectType,
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
  @Input() metadata: Metadata;
  @Input() level: number;
  @Input() path: Path;
  @Input() state;

  private EmitState = EmitState;

  private ObjectType = ObjectType;

  private emitState = new Map<string, EmitState>();

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
      const constructor = functionName(object.constructor) || typeof object;

      if (/object/i.test(constructor)) {
        if (Object.keys(object).length === 0) {
          return '{}'; // special case to denote an empty object
        }
      }

      return constructor;
    }
    else if (object === null) {
      return 'null';
    }
    else if (object === undefined) {
      return 'undefined';
    }
  }

  private expandable(key: string) {
    if (this.isEmittable(key) || !this.nest(key)) {
      return false;
    }
    return Object.keys(this.state[key] || {}).length > 0;
  }

  private evaluate(data: string) {
    try {
      return (new Function(`return ${data}`))();
    }
    catch (e) {
      return data;
    }
  }

  private getMetadata(key: string): [ObjectType, any] {
    return this.metadata.get(md5(serializePath(this.path.concat([key]))));
  }

  private isEmittable(key: string): boolean {
    const metadata = this.getMetadata(key);
    if (metadata) {
      return (metadata[0] & ObjectType.EventEmitter) !== 0
          || (metadata[0] & ObjectType.Subject) !== 0;
    }
    return false;
  }

  private isObjectType(key: string, type: ObjectType): boolean {
    const metadata = this.getMetadata(key);
    if (metadata) {
      return (metadata[0] & type) !== 0;
    }
    return false;
  }

  private getAlias(key: string): string {
    const metadata = this.getMetadata(key);
    if (metadata) {
      const additionalProperties = metadata[1];
      if (additionalProperties) {
        return additionalProperties.alias;
      }
    }
  }

  private getSelector(key: string): string {
    const metadata = this.getMetadata(key);
    if (metadata) {
      const additionalProperties = metadata[1];
      if (additionalProperties) {
        return additionalProperties.selector;
      }
    }
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
