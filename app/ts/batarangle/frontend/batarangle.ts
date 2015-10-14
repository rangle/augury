import {Component, View, Inject, bootstrap, bind} from 'angular2/angular2';
import {ComponentTree} from './core/tree-view/tree-view-api';
import {TreeView} from './components/tree-view/tree-view-component';
import {Dispatcher} from './dispatcher/dispatcher';
import {BackendActions} from './actions/backend-actions/backend-actions';
import {TreeViewStore} from './stores/tree-view/tree-view-store';

@Component({
  selector: 'bt-app'
})
@View({
  directives: [TreeView],
  template: '<bt-tree-view [node]="node"></bt-tree-view>'
})
class App {
  private node;

  constructor(
    private backendAction: BackendActions,
    private treeViewStore: TreeViewStore) {

    this.backendAction.rootFound();
    
    this.treeViewStore.dataStream.subscribe(
      data => {
        this.node = data;
        console.log('Application Root Received: ', this.node);
      }
    );
    
  }
}

bootstrap(App, [ComponentTree, BackendActions, Dispatcher, TreeViewStore]);