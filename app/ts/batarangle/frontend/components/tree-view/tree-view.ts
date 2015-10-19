import {Component, View, NgFor, LifeCycle, Inject} from 'angular2/angular2';
import {NodeItem} from '../node-item/node-item';
import {InfoPanel} from '../info-panel/info-panel';
import {UserActions} from '../../actions/user-actions/user-actions';

@Component({
  selector: 'bt-tree-view',
  properties: ['tree: tree']
})
@View({
  templateUrl: 'components/tree-view/tree-view.html',
  directives: [NgFor, NodeItem, InfoPanel]
})
/**
 * The Tree View
 */
export class TreeView {

  private tree: any;
  constructor(
    private userActions: UserActions,
    @Inject(LifeCycle) private lifeCycle: LifeCycle
  ) {
  }

  /**
   * Query for a node
   * @param  {String} query
   */
  onChange(query) {
    this.userActions.searchNode({ query });
    this.lifeCycle.tick();
  }

}
