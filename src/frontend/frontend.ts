import {Component, View, Inject, bind, NgZone} from 'angular2/core';
import {bootstrap} from 'angular2/bootstrap';

import {Dispatcher} from './dispatcher/dispatcher';

import {BackendActions} from './actions/backend-actions/backend-actions';
import {UserActions} from './actions/user-actions/user-actions';

import {UserActionType}
  from './actions/action-constants';

import {ComponentDataStore}
  from './stores/component-data/component-data-store';

import {BackendMessagingService} from './channel/backend-messaging-service';

import {TreeView} from './components/tree-view/tree-view';
import {InfoPanel} from './components/info-panel/info-panel';
import * as Rx from 'rxjs';

const BASE_STYLES = require('!style!css!postcss!../styles/app.css');

@Component({
  selector: 'bt-app'
})
@View({
  directives: [TreeView, InfoPanel],
  template: `
    <div class="clearfix">
      <div class="col col-6 overflow-scroll">
        <bt-tree-view [tree]="tree"></bt-tree-view>
      </div>
      <div class="col col-6 overflow-scroll">
        <bt-info-panel></bt-info-panel>
      </div>
    </div>`
})
/**
 * Batarangle App
 */
class App {

  private tree: any;
  private previousTree: any;

  constructor(
    private backendAction: BackendActions,
    private userActions: UserActions,
    private componentDataStore: ComponentDataStore,
    private _ngZone: NgZone
  ) {

    this.userActions.startComponentTreeInspection();

    // Listen for changes in selected node
    this.componentDataStore.dataStream
      .filter((data: any) => data.action &&
              data.action === UserActionType.START_COMPONENT_TREE_INSPECTION)
      .subscribe(data => {
        if (!this.tree) {
          this.tree = data.componentData;
        } else {
          this.previousTree = this.tree;
          this.tree = data.componentData;
        }
        this._ngZone.run(() => undefined);

        if (data.openedNodes.length > 0 || data.selectedNode) {
          this.userActions.updateNodeState({
            openedNodes: data.openedNodes,
            selectedNode: data.selectedNode
          });
        }

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
