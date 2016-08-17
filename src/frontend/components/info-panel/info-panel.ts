import {
  Component,
  ElementRef,
  Inject,
  NgZone,
  Input,
} from '@angular/core';

import {UserActions} from '../../actions/user-actions/user-actions';
import {UserActionType} from '../../actions/action-constants';

import TabMenu from '../tab-menu/tab-menu';
import ComponentInfo from '../component-info/component-info';
import InjectorTree from '../injector-tree/injector-tree';

@Component({
  selector: 'bt-info-panel',
  template: require('./info-panel.html'),
  directives: [TabMenu, ComponentInfo, InjectorTree]
})
export class InfoPanel {
  @Input() tree;
  @Input() node;
  @Input() theme: string;

  private selectedTabIndex: number = 0;

  private tabs = [{
      title: 'Properties',
      selected: false
    }, {
      title: 'Injector Graph',
      selected: false
    }];

  constructor(private userActions: UserActions) {}

  tabChange(index: number): void {
    this.selectedTabIndex = index;
  }

  selectNode(node: any): void {
    this.userActions.selectNode({ node: node });
  }
}
