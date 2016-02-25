import {Component, View, ElementRef, Inject} from 'angular2/core';
import {NgIf} from 'angular2/common';
import * as Rx from 'rxjs';
import {ComponentDataStore}
  from '../../stores/component-data/component-data-store';
import {UserActions} from '../../actions/user-actions/user-actions';
import {UserActionType} from '../../actions/action-constants';

import TabMenu from '../tab-menu/tab-menu';
import ComponentInfo from '../component-info/component-info';
import DependentComponents from '../dependent-components/dependent-components';

@Component({
  selector: 'bt-info-panel'
})
@View({
  templateUrl: '/src/frontend/components/info-panel/info-panel.html',
  directives: [NgIf, TabMenu, ComponentInfo, DependentComponents]
})
export class InfoPanel {

  private node: any;
  private selectedTabIndex: number = 0;
  private dependentComponents = [];
  private selectedDependency: string;

  constructor(
    private componentDataStore: ComponentDataStore,
    private userActions: UserActions,
    @Inject(ElementRef) private elementRef: ElementRef
  ) {

    this.componentDataStore.dataStream
      .filter((data: any) => data.action &&
        data.action !== UserActionType.GET_DEPENDENCIES)
      .debounce((x) => {
        return Rx.Observable.timer(100);
      })
      .subscribe(({ selectedNode }) => {
        this.selectedTabIndex = 0;
        this.node = selectedNode;
      });

    this.componentDataStore.dataStream
      .filter((data: any) => data.action &&
        data.action === UserActionType.GET_DEPENDENCIES)
      .subscribe(({ selectedDependency, dependentComponents }) => {
        this.selectedTabIndex = 1;
        this.selectedDependency = selectedDependency;
        this.dependentComponents = dependentComponents;
      });

  }

  tabChange(index: number): void {
    this.selectedTabIndex = index;
  }

  selectDependency(dependency: string): void {
    this.userActions.getDependencies(dependency);
  }

  selectNode(node: any): void {
    this.userActions.selectNode({ node: node });
  }

}
