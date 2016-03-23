import {Component, ElementRef, Inject,Input, NgZone} from 'angular2/core';
import {NgIf, NgClass} from 'angular2/common';

import * as Rx from 'rxjs';
import {ComponentDataStore}
  from '../../stores/component-data/component-data-store';
import {UserActions} from '../../actions/user-actions/user-actions';
import {UserActionType} from '../../actions/action-constants';

import TabMenu from '../tab-menu/tab-menu';
import ComponentInfo from '../component-info/component-info';
import DependentComponents from '../dependent-components/dependent-components';
import InjectorTree from '../injector-tree/injector-tree';

@Component({
  selector: 'bt-info-panel',
  templateUrl: '/src/frontend/components/info-panel/info-panel.html',
  directives: [NgIf, TabMenu, ComponentInfo, DependentComponents, InjectorTree]
})
export class InfoPanel {

  @Input() tree;

  private node: any;
  private selectedTabIndex: number = 0;
  private dependentComponents = [];
  private selectedDependency: string;

  private tabs = [{
    title: 'Properties',
    selected: false
  }, {
      title: 'Dependent Components',
      selected: false
    }, {
      title: 'Injector Tree',
      selected: false
    }];

  constructor(
    private componentDataStore: ComponentDataStore,
    private userActions: UserActions,
    private _ngZone: NgZone,
    @Inject(ElementRef) private elementRef: ElementRef
  ) {

    this.componentDataStore.dataStream
      .filter((data: any) => {
        return (data.action &&
          data.action !== UserActionType.GET_DEPENDENCIES &&
          data.action !== UserActionType.START_COMPONENT_TREE_INSPECTION);
      })
      .subscribe(({ selectedNode }) => {
        // this.selectedTabIndex = 0;
        this.node = selectedNode;
        this._ngZone.run(() => undefined);
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
