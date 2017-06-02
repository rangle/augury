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
import {MainActions} from '../../actions/main-actions';

@Component({
  selector: 'bt-components-tab-menu',
  template: require('./components-tab-menu.html'),
})
export class ComponentsTabMenu {
  @Input() selectedStateTab;

  private tabs: Array<StateTabDescription> = [{
    title: 'Properties',
    tab: StateTab.Properties,
  }, {
    title: 'Injector Graph',
    tab: StateTab.InjectorGraph,
  }];

  constructor(private userActions: UserActions, private mainActions: MainActions) {
  }

  private onSelect(tab: StateTabDescription) {
    this.mainActions.selectComponentsSubTab(tab.tab);
  }
}
