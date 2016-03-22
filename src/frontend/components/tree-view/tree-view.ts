import {Component, Inject, NgZone, ElementRef} from 'angular2/core';
import {NgFor} from 'angular2/common';
import {NodeItem} from '../node-item/node-item';
import {UserActions} from '../../actions/user-actions/user-actions';
import {ComponentDataStore}
  from '../../stores/component-data/component-data-store';
import {UserActionType}
  from '../../actions/action-constants';
import {TreeSearch} from '../tree-search/tree-search';

@Component({
  selector: 'bt-tree-view',
  properties: ['tree: tree'],
  templateUrl: 'src/frontend/components/tree-view/tree-view.html',
  directives: [NgFor, NodeItem, TreeSearch]
})
/**
 * The Tree View
 * Displays the components' hierarchy
 */
export class TreeView {

  private tree: any;
  private nativeElement: HTMLElement;

  constructor(
    private userActions: UserActions,
    private componentDataStore: ComponentDataStore,
    private element: ElementRef
  ) {
    this.nativeElement = element.nativeElement;

    this.componentDataStore.dataStream
      .filter((data) => {
        return  data.action && data.action === UserActionType.SELECT_NODE &&
          data.selectedNode && data.selectedNode.id;
        })
        .map(({ selectedNode }: any) => selectedNode)
        .subscribe((selectedNode: any) => {
          this.scrollToViewIfNeeded(selectedNode.nativeElement);
        });
  }

  scrollToViewIfNeeded(elem: HTMLElement) {
    const selectedNodeBound = elem.getBoundingClientRect();
    const treeViewBound = this.nativeElement.getBoundingClientRect();
    console.log('node ', selectedNodeBound);
    console.log('tree ', treeViewBound);
    if (treeViewBound.height - treeViewBound.top < selectedNodeBound.bottom) {
      console.log('not visible');
    }
    // const elemBottomY = elem.getBoundingClientRect().top
    //                   + elem.getBoundingClientRect().height
    //                   - this.nativeElement.getBoundingClientRect().height;
    // // console.log('window', window);
    // console.log('elemBottomY', elemBottomY);
    // if (this.nativeElement.scrollTop < elemBottomY) {
    //   this.nativeElement.scrollTop = elemBottomY;
    // }
  }

}
