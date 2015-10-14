import {Component, View, Inject, bootstrap, bind} from 'angular2/angular2';

import {TreeView} from './components/tree-view/tree-view-component';
import {Dispatcher} from './dispatcher/dispatcher';
import {BackendActions} from './actions/backend-actions/backend-actions';
import {UserActions} from './actions/user-actions/user-actions';
import {ComponentDataStore} from './stores/component-data/component-data-store';
import {BackendMessagingService} from './channel/backend-messaging-service';

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
    private userActions: UserActions,
    private componentDataStore: ComponentDataStore) {

    Rx.Observable.interval(1000).take(1).subscribe(() => {
      this.userActions.getComponentData();
    });

    chrome.devtools.inspectedWindow.eval(
      "ng.probe",
      function(result, isException) {
        if (isException)
          console.log("the page is not using ng.probe");
        else
          console.log("The page is using ng.probe v" + result);
      }
    );
    
    this.node = { name: 'hello' }
    
    this.componentDataStore.dataStream.subscribe(
      componentData => {
        //this.node = { name: 'hello' };//componentData;
        console.log('Application Root Received: ', componentData);
      }
    );

  }
}

bootstrap(App, [
  BackendActions,
  UserActions,
  Dispatcher,
  ComponentDataStore,
  BackendMessagingService
]);