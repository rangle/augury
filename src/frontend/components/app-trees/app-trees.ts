import {
  Component,
  Output,
  EventEmitter,
  Input
} from '@angular/core';

import {TreeView} from '../tree-view/tree-view';
import {RouterTree} from '../router-tree/router-tree';
import {
  TabDescription,
  TabMenu,
} from '../tab-menu/tab-menu';
import {
  Tab,
  Theme,
} from '../../state';

@Component({
  selector: 'bt-app-trees',
  directives: [
    TabMenu,
    TreeView,
    RouterTree,
  ],
  template: require('./app-trees.html'),
})
export default class AppTrees {
  private Tab = Tab;

  @Input() theme: Theme;
  @Input() tree: Array<Node>;
  @Input() routerTree: any;
  @Input() selectedTab: Tab;
  @Input() selectedNode: Node;
  @Input() changedNodes: Array<any>;
  @Input() closedNodes: Array<any>;

  @Output() tabChange: EventEmitter<Tab> = new EventEmitter<Tab>();

  private tabs = [{
    title: 'Component Tree',
    selected: false,
    tab: Tab.ComponentTree,
  }, {
    title: 'Router Tree',
    selected: false,
    tab: Tab.RouterTree,
  }];

  onTabSelectionChanged(index: number): void {
    this.tabChange.emit(this.tabs[index].tab);
  }
}
