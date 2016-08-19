import {bootstrap} from '@angular/platform-browser-dynamic';
import {
  Component,
  NgZone,
} from '@angular/core';

import {
  Message,
  MessageFactory,
  MessageType,
  MessageResponse,
} from '../communication';

import {Connection} from './channel/connection';
import {UserActions} from './actions/user-actions/user-actions';
import {UserActionType} from './actions/action-constants';
import {TreeView} from './components/tree-view/tree-view';
import {InfoPanel} from './components/info-panel/info-panel';
import AppTrees from './components/app-trees/app-trees';
import {Header} from './components/header/header';
import {ParseUtils} from './utils/parse-utils';
import {ComponentInfo} from '../tree';

require('!style!css!postcss!../styles/app.css');

@Component({
  selector: 'bt-app',
  providers: [ParseUtils],
  directives: [TreeView, InfoPanel, AppTrees, Header],
  template: `
    <template [ngIf]="initializationFailure">
      <h3>Failed to initialize Augury</h3>
      <p><pre>{{initializationFailure}}</pre></p>
    </template>
    <div *ngIf="!initializationFailure"
      class="clearfix vh-100 overflow-hidden flex flex-column"
      [ngClass]="{'dark': theme === 'dark'}">
      <augury-header
        [searchDisabled]="searchDisabled"
        [theme]="theme"
        (newTheme)="themeChanged($event)">
      </augury-header>
      <div class="flex flex-auto">
        <div class="col col-6 overflow-hidden
          border-right border-color-dark flex"
        [ngClass]="{'overflow-scroll col-12': selectedTabIndex > 0}">
          <bt-app-trees #trees
            class="flex flex-column flex-auto bg-white"
            [selectedTabIndex]="selectedTabIndex"
            [selectedNode]="selectedNode"
            [routerTree]="routerTree"
            [theme]="theme"
            [allowedComponentTreeDepth]="3"
            (tabChange)="tabChange($event)">
          </bt-app-trees>
        </div>
        <div class="col col-6 overflow-hidden"
          [ngClass]="{'flex': selectedTabIndex === 0}"
          [hidden]="selectedTabIndex > 0">
          <bt-info-panel
            class="flex flex-column flex-auto bg-white"
            [tree]="tree"
            [theme]="theme"
            [node]="selectedNode">
          </bt-info-panel>
        </div>
      </div>
    </div>`
})
class App {
  private selectedNode: ComponentInfo;
  private selectedTabIndex = 0;
  private searchDisabled: boolean = false;
  private theme: string;
  private initializationFailure: string;

  constructor(
    private connection: Connection,
    private userActions: UserActions,
    private ngZone: NgZone,
    private parseUtils: ParseUtils
  ) {
    chrome.storage.sync.get('theme',
      (result: {theme: string})  => {
        this.ngZone.run(() => {
            this.theme = result.theme || 'light';
        });
      });
  }

  private ngOnInit() {
    this.connection.connect();

    this.connection.subscribe(this.onReceiveMessage.bind(this));;

    this.connection.send(MessageFactory.initialize())
      .catch(error => {
        this.initializationFailure = error.stack;
      });
  }

  private ngOnDestroy() {
    this.connection.close();
  }

  private tabChange(index: number) {
    this.selectedTabIndex = index;
    if (index === 1) {
      this.userActions.renderRouterTree();
      this.searchDisabled = true;
    } else {
      this.searchDisabled = false;
    }
  }

  private themeChanged(newTheme: string): void {
    this.theme = newTheme;
    // Set the new theme
    chrome.storage.sync.set({ theme: newTheme });
  }

  private onReceiveMessage(msg: Message<any>,
      sendResponse: (response: MessageResponse<any>) => void) {
    switch (msg.messageType) {
      case MessageType.CompleteTree:
        debugger;
        sendResponse(MessageFactory.response(msg, {processed: true}));
        break;
      case MessageType.TreeDiff:
        debugger;
        sendResponse(MessageFactory.response(msg, {processed: true}));
        break;
      default:
        debugger;
        break;
    }
  }
}

bootstrap(App, [
  Connection,
  UserActions,
]);
