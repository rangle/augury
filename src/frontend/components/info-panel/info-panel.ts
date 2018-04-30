import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {ComponentLoadState, StateTab} from '../../state';
import {UserActions} from '../../actions/user-actions/user-actions';
import {
  ComponentMetadata,
  InstanceWithMetadata,
  Metadata,
  Node,
  ObjectType,
  Path,
} from '../../../tree';

@Component({
  selector: 'bt-info-panel',
  templateUrl: './info-panel.html',
})
export class InfoPanel {
  @Input() tree;
  @Input() ngModules: {[key: string]: any};
  @Input() node;
  @Input() instanceValue: InstanceWithMetadata;
  @Input() loadingState: ComponentLoadState;
  @Input() selectedStateTab: StateTab;

  @Output() selectNode: EventEmitter<any> = new EventEmitter<any>();
  @Output() componentsSubTabMenuChange: EventEmitter<StateTab> = new EventEmitter<StateTab>();
  @Output() emitValue = new EventEmitter<{path: Path, data: any}>();
  @Output() updateProperty = new EventEmitter<{path: Path, newValue: any}>();

  StateTab = StateTab;

  constructor(private userActions: UserActions) {}

  get state() {
    if (this.instanceValue) {
      return this.instanceValue.instance;
    }
    return null;
  }

  get metadata(): Metadata {
    return this.instanceValue
      ? this.instanceValue.metadata
      : new Map<string, [ObjectType, any]>();
  }

  get providers(): {[token: string]: any} {
    return this.instanceValue
      ? this.instanceValue.providers
      : {};
  }

  get componentMetadata(): ComponentMetadata {
    return this.instanceValue
      ? this.instanceValue.componentMetadata
      : new Map<string, [[string, ObjectType, any]]>();
  }
}
