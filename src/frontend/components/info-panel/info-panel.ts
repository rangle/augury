import {Component, ElementRef, Inject, NgZone, Input} from 'angular2/core';
import {NgIf, NgClass} from 'angular2/common';
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
  templateUrl: '/src/frontend/components/info-panel/info-panel.html',
  directives: [NgIf, TabMenu, ComponentInfo, InjectorTree]
})
export class InfoPanel {

  @Input() tree: any;

  private node: any;
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
    private userActions: UserActions,
    private _ngZone: NgZone,
    @Inject(ElementRef) private elementRef: ElementRef
  ) {

    this.componentDataStore.dataStream
      .debounce(() => Rx.Observable.timer(250))
      .filter((data: any) => {
        return (data.action &&
          data.action !== UserActionType.GET_DEPENDENCIES &&
          data.action !== UserActionType.RENDER_ROUTER_TREE &&
          data.action !== UserActionType.START_COMPONENT_TREE_INSPECTION);
      })
      .subscribe(({ selectedNode }) => {
        this.node = selectedNode;
        this._ngZone.run(() => undefined);
      });

  }

  tabChange(index: number): void {
    this.selectedTabIndex = index;
  }

  selectNode(node: any): void {
    this.userActions.selectNode({ node: node });
  }

}
