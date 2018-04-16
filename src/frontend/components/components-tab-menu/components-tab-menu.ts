import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  InstanceWithMetadata,
  Metadata,
  Node,
  ObjectType,
  Path,
} from '../../../tree';

import {StateTab} from '../../state';

export interface StateTabDescription {
  title: string;
  tab;
}

import {UserActions} from '../../actions/user-actions/user-actions';

@Component({
  selector: 'bt-components-tab-menu',
  templateUrl: './components-tab-menu.html',
})
export class ComponentsTabMenu {
  @Input() selectedStateTab;
  @Output() tabChange: EventEmitter<any> = new EventEmitter<any>();

  tabs: Array<StateTabDescription> = [{
    title: 'Properties',
    tab: StateTab.Properties,
  }, {
    title: 'Injector Graph',
    tab: StateTab.InjectorGraph,
  }];

  constructor(private userActions: UserActions) {
  }

  private onSelect(tab: StateTabDescription) {
    this.tabChange.emit(tab.tab);
  }
}
