import {Component, View, NgIf, NgFor, NgStyle, LifeCycle, Inject}
  from 'angular2/angular2';
import {ComponentDataStore}
  from '../../stores/component-data/component-data-store';
import {UserActions} from '../../actions/user-actions/user-actions';

@Component({
  selector: 'bt-node-item',
  properties: ['node: node', 'collapsed: collapsed']
})
@View({
  templateUrl: 'components/node-item/node-item.html',
  directives: [NgIf, NgFor, NodeItem, NgStyle]
})
/**
 * Node Item
 */
export class NodeItem {

  private node: any;
  private collapsed: any;
  private color: any;
  private borderColor: any;
  private isSelected: boolean;
  constructor(
    private userActions: UserActions,
    private componentDataStore: ComponentDataStore,
    @Inject(LifeCycle) private lifeCycle: LifeCycle
  ) {

    this.borderColor = 'rgba(0, 0, 0, 0.125)';
    this.color = '#666';

    // Listen for changes to selected node
    this.componentDataStore.dataStream
      .pluck('selectedNode')
      .distinctUntilChanged((selectedNode: any) => {
        return selectedNode ? selectedNode.id : '';
      })
      .subscribe((selectedNode: any) => {
        const isSelected = this.node && selectedNode &&
          selectedNode.id === this.node.id;
        this.update(isSelected);
      });

  }

  /**
   * Update the state of the node based on selection
   * @param  {Boolean} isSelected
   */
  update(isSelected) {
    this.isSelected = isSelected;
    this.borderColor = isSelected ? '#0074D9' :
          'rgba(0, 0, 0, 0.125)';
    this.color = isSelected ? '#222' : '#888';
  }

  /**
   * Select a node on click
   * @param  {Object} $event
   */
  onClick($event) {

    this.userActions.selectNode({ node: this.node });
    this.lifeCycle.tick();
    event.stopPropagation();

  }

}
