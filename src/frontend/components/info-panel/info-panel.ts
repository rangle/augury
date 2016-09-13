import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {ComponentLoadState} from '../../state';
import {StateTab} from '../../state';
import {UserActions} from '../../actions/user-actions/user-actions';
import {
  InstanceValue,
  Metadata,
  Node,
  PropertyMetadata,
} from '../../../tree';

@Component({
  selector: 'bt-info-panel',
  template: require('./info-panel.html'),
})
export class InfoPanel {
  @Input() tree;
  @Input() node;
  @Input() instanceValue: InstanceValue;
  @Input() loadingState: ComponentLoadState;

  @Output() private selectNode = new EventEmitter<Node>();

  private StateTab = StateTab;

  private selectedTab = StateTab.Properties;

  private tabs = [{
      title: 'Properties',
      selected: false,
      tab: StateTab.Properties,
    }, {
      title: 'Injector Graph',
      selected: false,
      tab: StateTab.InjectorGraph,
    }];

  constructor(private userActions: UserActions) {}

  private get state() {
    if (this.instanceValue) {
      return this.instanceValue.instance;
    }
    return null;
  }

  private get metadata(): Metadata {
    if (this.instanceValue) {
      return this.instanceValue.metadata;
    }

    return new Map<string, PropertyMetadata>();
  }

  private onSelectedTabChanged(tab: StateTab) {
    this.selectedTab = tab;
  }
}
