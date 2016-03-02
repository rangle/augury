import {Component} from 'angular2/core';

import TabMenu from '../tab-menu/tab-menu';
import RouterTree from '../router-tree/router-tree';
import {TreeView} from '../tree-view/tree-view';

@Component({
  selector: 'bt-app-trees',
  directives: [TabMenu, RouterTree, TreeView],
  inputs: ['tree'],
  templateUrl:
    '/src/frontend/components/app-trees/app-trees.html'
})
export default class AppTrees {

  private selectedTabIndex: number = 0;
  private tabs = [{
    title: 'Component Tree',
    selected: false
  }, {
      title: 'Router Tree',
      selected: false
    }];

  tabChange(index: number): void {
    this.selectedTabIndex = index;
  }

}
