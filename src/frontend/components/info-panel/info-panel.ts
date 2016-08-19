import {
  Component,
  ElementRef,
  Inject,
  NgZone,
  Input,
} from '@angular/core';

import {UserActions} from '../../actions/user-actions/user-actions';
import {UserActionType} from '../../actions/action-constants';
import {StateTab, Theme} from '../../state';
import {TabMenu} from '../tab-menu/tab-menu';
import {ComponentInfo} from '../component-info/component-info';
import {InjectorTree} from '../injector-tree/injector-tree';
import {Node} from '../../../tree';

@Component({
  selector: 'bt-info-panel',
  template: require('./info-panel.html'),
  directives: [
    ComponentInfo,
    InjectorTree,
    TabMenu,
  ]
})
export class InfoPanel {
  @Input() tree;
  @Input() node;
  @Input() theme: Theme;

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

  onSelectedTabChanged(tab: StateTab) {
    debugger;
    this.selectedTab = tab;
  }

  onSelectInjectorNode(node: Node) {
    this.userActions.selectComponent(node);
  }
}
