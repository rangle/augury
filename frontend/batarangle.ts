import {Component, View, Inject, bind, NgZone} from 'angular2/core';
import {bootstrap} from 'angular2/bootstrap';
import {TreeView} from './components/tree-view/tree-view';
import {Dispatcher} from './dispatcher/dispatcher';
import {BackendActions} from './actions/backend-actions/backend-actions';
import {UserActions} from './actions/user-actions/user-actions';
import {ComponentDataStore}
  from './stores/component-data/component-data-store';
import {BackendMessagingService} from './channel/backend-messaging-service';

@Component({
  selector: 'bt-app'
})
@View({
  directives: [TreeView],
  template: '<bt-tree-view [tree]="tree"></bt-tree-view>'
})
/**
 * Batarangle App
 */
class App {

  private tree: any;
  constructor(
    private backendAction: BackendActions,
    private userActions: UserActions,
    private componentDataStore: ComponentDataStore,
    private _ngZone: NgZone
  ) {

    this.userActions.startComponentTreeInspection();

    this.componentDataStore.dataStream
      .map(({ componentData }: any) => componentData)
      .subscribe(componentData => {
        console.log('Application Root Received: ', componentData);
        this.tree = componentData;
        this._ngZone.run(() => undefined);
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
