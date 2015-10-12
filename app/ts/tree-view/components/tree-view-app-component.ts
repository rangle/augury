import {bootstrap, Component, View, Inject} from 'angular2/angular2';
import {ComponentTree} from '../core/tree-view-api';
import {TreeView} from './tree-view-component';

@Component({
  selector: 'tree-view-app'
})
@View({
  directives: [TreeView],
  templateUrl: 'components/tree-view-app-component.html'
})
export class TreeViewApp {
  
  private node;
  
  constructor(@Inject(ComponentTree) private componentTree: ComponentTree) {
    
    this.node = componentTree.componentTree.first();
    console.log('first_node: ', this.node);
  }
}

bootstrap(TreeViewApp, [ComponentTree]);