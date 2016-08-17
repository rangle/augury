import {
  Component,
  Output,
  EventEmitter,
  Input
} from '@angular/core';
import TabMenu from '../tab-menu/tab-menu';
import {TreeView} from '../tree-view/tree-view';
import {RouterTree} from '../router-tree/router-tree';

@Component({
  selector: 'bt-app-trees',
  directives: [TabMenu, TreeView, RouterTree],
  template: require('./app-trees.html'),
})
export default class AppTrees {

  @Input() theme: string;
  @Input() tree: any;
  @Input() routerTree: any;
  @Input() selectedTabIndex: number;
  @Input() selectedNode: any;
  @Input() changedNodes: any;
  @Input() closedNodes: Array<any>;
  @Input() allowedComponentTreeDepth: number;

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
