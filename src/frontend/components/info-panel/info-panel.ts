import {Component, ElementRef, Inject, NgZone, Input} from '@angular/core';
import {NgIf, NgClass} from '@angular/common';
import * as Rx from 'rxjs';
import {ComponentDataStore}
  from '../../stores/component-data/component-data-store';
import {UserActions} from '../../actions/user-actions/user-actions';
import {UserActionType} from '../../actions/action-constants';

import TabMenu from '../tab-menu/tab-menu';
import ComponentInfo from '../component-info/component-info';
import InjectorTree from '../injector-tree/injector-tree';

@Component({
  selector: 'bt-info-panel',
  template: require('./info-panel.html'),
  directives: [NgIf, TabMenu, ComponentInfo, InjectorTree]
})
export class InfoPanel {

  @Input() tree: any;
  @Input() node: any;
  @Input() theme: string;

  private selectedTabIndex: number = 0;
  private tabs = [{
      title: 'Properties',
      selected: false
    }, {
      title: 'Injector Graph',
      selected: false
    }];

  constructor(
    private componentDataStore: ComponentDataStore,
    private userActions: UserActions
  ) {}

  tabChange(index: number): void {
    this.selectedTabIndex = index;
  }

  selectNode(node: any): void {
    this.userActions.selectNode({ node: node });
  }

}
