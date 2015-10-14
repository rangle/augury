import {bootstrap, Component, View, Inject, NgIf, NgFor} from 'angular2/angular2';

@Component({
  selector: 'bt-tree-view',
  inputs: ['node: node']
})
@View({
  templateUrl: 'components/tree-view/tree-view-component.html',
  directives: [NgIf, NgFor, TreeView]
})
export class TreeView {

  private showSingle: boolean;
  private node: any;
  
  constructor() {
    console.log('this: ', this);
    this.showSingle = true; //= this.node.children.size > 1;
  }
}
