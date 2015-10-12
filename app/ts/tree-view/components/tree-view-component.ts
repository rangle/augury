import {bootstrap, Component, View, Inject, NgIf, NgFor} from 'angular2/angular2';
import {ComponentTree} from '../core/tree-view-api';

@Component({
  selector: 'tree-view',
  properties: ['node: node']
})
@View({
  templateUrl: 'components/tree-view-component.html',
  directives: [NgIf, NgFor, TreeView]
})
export class TreeView {

  private showSingle: boolean;
  private node: any;
  
  constructor() {
    console.log('this: ', this);
    console.log('node: ', this.node);
    this.showSingle = true; //= this.node.children.size > 1;
  }
}
