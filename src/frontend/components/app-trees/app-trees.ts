import {Component, Output, EventEmitter}
  from 'angular2/core';
import {NgClass} from 'angular2/common';
import TabMenu from '../tab-menu/tab-menu';
import {TreeView} from '../tree-view/tree-view';
import {RouterTree} from '../router-tree/router-tree';

@Component({
  selector: 'bt-app-trees',
  directives: [TabMenu, TreeView, RouterTree],
  inputs: ['tree', 'routerTree', 'selectedTabIndex',
    'selectedNode', 'changedNodes'],
  host: {'class': 'flex flex-column vh-100'},
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
