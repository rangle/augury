import {Component, Inject, bind, NgZone} from 'angular2/core';
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
import AppTrees from './components/app-trees/app-trees';

import * as Rx from 'rxjs';

import {ParseUtils} from './utils/parse-utils';

const BASE_STYLES = require('!style!css!postcss!../styles/app.css');

@Component({
  selector: 'bt-app',
  providers: [ParseUtils],
  directives: [TreeView, InfoPanel, AppTrees],
  template: `
    <div class="clearfix">
      <div class="col col-6 overflow-hidden vh-100 
      border-right border-color-dark"
      [ngClass]="{'col-12 overflow-scroll': selectedTabIndex > 0}">
        <bt-app-trees
          [selectedTabIndex]="selectedTabIndex"
          [selectedNode]="selectedNode"
          [routerTree]="routerTree"
          [tree]="tree"
          [changedNodes]="changedNodes"
          (tabChange)="tabChange($event)">
        </bt-app-trees>
      </div>
      <div class="col col-6 overflow-hidden vh-100"
      [hidden]="selectedTabIndex > 0">
        <bt-info-panel [tree]="tree"></bt-info-panel>
      </div>
    </div>`
})
/**
 * Batarangle App
 */
class App {

  private tree: any;
  private previousTree: any;
  private routerTree: any;
  private selectedTabIndex = 0;
  private selectedNode: any;
  private changedNodes: any = [];

  constructor(
    private backendAction: BackendActions,
    private userActions: UserActions,
    private componentDataStore: ComponentDataStore,
    private _ngZone: NgZone,
    private parseUtils: ParseUtils
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
          this.changedNodes =
            parseUtils.getChangedNodes(this.previousTree, this.tree);
        }

        this._ngZone.run(() => undefined);

        if (data.openedNodes.length > 0 || data.selectedNode) {
          setTimeout(() => {
            this.userActions.updateNodeState({
              openedNodes: data.openedNodes,
              selectedNode: data.selectedNode
            });
          }, 250);
        }
      }
    );

    this.componentDataStore.dataStream
      .filter((data: any) => data.action &&
              data.action === UserActionType.RENDER_ROUTER_TREE)
      .subscribe(data => {
        this.routerTree = data.tree.tree;
        this._ngZone.run(() => undefined);
      }
    );

    this.componentDataStore.dataStream
      .filter((data: any) => {
        return (data.action &&
          data.action !== UserActionType.GET_DEPENDENCIES &&
          data.action !== UserActionType.RENDER_ROUTER_TREE &&
          data.action !== UserActionType.START_COMPONENT_TREE_INSPECTION);
      })
      .subscribe(({ selectedNode }) => {
        this.selectedNode = selectedNode;
      });

  }

  tabChange(index: number) {
    this.selectedTabIndex = index;
    if (index === 1) {
      this.userActions.renderRouterTree();
    }
  }
}

bootstrap(App, [
  BackendActions,
  UserActions,
  Dispatcher,
  ComponentDataStore,
  BackendMessagingService
]);
