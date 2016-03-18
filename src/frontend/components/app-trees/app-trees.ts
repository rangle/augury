import {Component, Output, EventEmitter} from 'angular2/core';

import TabMenu from '../tab-menu/tab-menu';
import RouterTree from '../router-tree/router-tree';
import InjectorTree from '../injector-tree/injector-tree';
import {TreeView} from '../tree-view/tree-view';

@Component({
  selector: 'bt-app-trees',
  directives: [TabMenu, RouterTree, TreeView, InjectorTree],
  inputs: ['tree', 'routerTree', 'selectedTabIndex', 'selectedNode'],
  templateUrl:
    '/src/frontend/components/app-trees/app-trees.html'
})
export default class AppTrees {

  @Output() tabChange: EventEmitter<number> = new EventEmitter<number>();

  private tabs = [{
    title: 'Component Tree',
    selected: false
  }, {
      title: 'Router Tree',
      selected: false
    }];

  tabClicked(index: number): void {
    this.tabChange.emit(index);
  }

}
