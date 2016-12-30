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
  ComponentMetadata,
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
  @Input() componentMetadata: ComponentMetadata;
  @Input() metadata: Metadata;
  @Input() level: number;
  @Input() path: Path;
  @Input() pathTransformer: (nodePath: Path, propertyKey: string) => Path;
  @Input() state;
  @Input() indent: boolean = true;

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
      this.propertyState.toggleExpand(this.transformedPath(key));
    }
  }

  private get none() {
    return this.state == null || Object.keys(this.state).length === 0;
  }

  private transformedPath(key: string): Path {
    return typeof this.pathTransformer === 'function'
      ? this.pathTransformer(this.path, key)
      : this.path.concat([key]);
  }

  private nest(key: string): boolean {
    return typeof this.state[key] === 'object' && this.state[key] != null;
  }

  private expanded(key: string): boolean {
    return this.propertyState.expansionState(this.transformedPath(key)) === ExpandState.Expanded;
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

  private getComponentMetadata(key: string): [ObjectType, any] {
    const properties = this.componentMetadata.get(this.state);
    if (properties) {
      const matchingProperty = properties.find(p => p[0] === key);
      if (matchingProperty) {
        return [matchingProperty[1], matchingProperty[2]];
      }
    }
    return null;
  }

  private isEmittable(key: string): boolean {
    const metadata = this.metadata.get(this.state[key]);
    if (metadata) {
      return (metadata[0] & ObjectType.EventEmitter) !== 0
          || (metadata[0] & ObjectType.Subject) !== 0;
    }
    return false;
  }

  private isComponentObjectType(key: string, type: ObjectType): boolean {
    const metadata = this.getComponentMetadata(key);
    if (metadata) {
      return (metadata[0] & type) !== 0;
    }
  }

  private getAlias(key: string): string {
    const metadata = this.getComponentMetadata(key);
    if (metadata) {
      const additionalProperties = metadata[1];
      if (additionalProperties) {
        return additionalProperties.alias;
      }
    }
  }

  private getSelector(key: string): string {
    const metadata = this.getComponentMetadata(key);
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

    const path = this.transformedPath(outputProperty);

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
