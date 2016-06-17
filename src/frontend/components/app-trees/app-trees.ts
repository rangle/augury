import {Component, Output, EventEmitter, Input}
  from '@angular/core';
import {NgClass} from '@angular/common';
import TabMenu from '../tab-menu/tab-menu';
import {TreeView} from '../tree-view/tree-view';
import {RouterTree} from '../router-tree/router-tree';

@Component({
  selector: 'bt-app-trees',
  directives: [TabMenu, TreeView, RouterTree],
  inputs: ['tree', 'routerTree', 'selectedTabIndex',
    'selectedNode', 'changedNodes', 'openedNodes'],
  templateUrl:
    '/src/frontend/components/app-trees/app-trees.html'
})
export default class AppTrees {

  @Input() theme: string;
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
