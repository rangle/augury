import {Component, View, Inject, bind, NgZone} from 'angular2/core';
import {bootstrap} from 'angular2/bootstrap';

import {Dispatcher} from './dispatcher/dispatcher';

import {BackendActions} from './actions/backend-actions/backend-actions';
import {UserActions} from './actions/user-actions/user-actions';

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
  constructor(
    private backendAction: BackendActions,
    private userActions: UserActions,
    private componentDataStore: ComponentDataStore,
    private _ngZone: NgZone
  ) {

    this.userActions.startComponentTreeInspection();

    this.componentDataStore.dataStream
      .map(({ componentData }: any) => componentData)
      .debounce((x) => {
        return Rx.Observable.timer(500);
      })
      .subscribe(componentData => {
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
