import {
  Component,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';

import {Route} from '../../../backend/utils';
import {TabDescription} from '../tab-menu/tab-menu';
import {
  ComponentInstanceState,
  Options,
  Tab,
} from '../../state';

type Node = any;

@Component({
  selector: 'bt-app-trees',
  template: require('./app-trees.html'),
})
export class AppTrees {
  private Tab = Tab;

  @Input() private tree: Array<Node>;
  @Input() private routerTree: Array<Route>;
  @Input() private options: Options;
  @Input() private componentState: ComponentInstanceState;

  @Input() private selectedTab: Tab;
  @Input() private selectedNode: Node;
  @Input() private selectedRoute: Route;

  @Output() private collapseChildren = new EventEmitter<Node>();
  @Output() private expandChildren = new EventEmitter<Node>();
  @Output() private inspectElement = new EventEmitter<Node>();
  @Output() private selectNode = new EventEmitter<Node>();
  @Output() private tabChange = new EventEmitter<Tab>();

  private tabs: Array<TabDescription> = [{
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
