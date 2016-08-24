import {
  Component,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';

import {TreeView} from '../tree-view/tree-view';
import {RouterTree} from '../router-tree/router-tree';
import {Route} from '../../../backend/utils';
import {
  TabDescription,
  TabMenu,
} from '../tab-menu/tab-menu';
import {
  ComponentInstanceState,
  Options,
  Tab,
  Theme,
} from '../../state';

type Node = any;

@Component({
  selector: 'bt-app-trees',
  directives: [
    TabMenu,
    TreeView,
    RouterTree,
  ],
  template: require('./app-trees.html'),
})
export class AppTrees {
  private Tab = Tab;

  @Input() tree: Array<Node>;
  @Input() routerTree: Array<Route>;
  @Input() routerException: string;
  @Input() selectedTab: Tab;
  @Input() selectedNode: Node;
  @Input() options: Options;
  @Input() componentState: ComponentInstanceState;

  @Output() private tabChange = new EventEmitter<Tab>();
  @Output() private selectionChange = new EventEmitter<Node>();
  @Output() private inspectElement = new EventEmitter<Node>();

  private tabs = [{
    title: 'Component Tree',
    selected: false,
    tab: Tab.ComponentTree,
  }, {
    title: 'Router Tree',
    selected: false,
    tab: Tab.RouterTree,
  }];

  onTabSelectionChanged(index: number) {
    this.tabChange.emit(this.tabs[index].tab);
  }
}
