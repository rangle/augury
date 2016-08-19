import {bootstrap} from '@angular/platform-browser-dynamic';
import {
  ChangeDetectorRef,
  Component,
  NgZone,
} from '@angular/core';

import {
  Message,
  MessageFactory,
  MessageType,
  MessageResponse,
} from '../communication';

import {
  MutableTree,
  Node,
  createTree,
} from '../tree';

import {deserialize} from '../utils/serialize';

import {Connection} from './channel/connection';
import {UserActions} from './actions/user-actions/user-actions';
import {UserActionType} from './actions/action-constants';
import {TreeView} from './components/tree-view/tree-view';
import {InfoPanel} from './components/info-panel/info-panel';
import AppTrees from './components/app-trees/app-trees';
import {Header} from './components/header/header';
import {ParseUtils} from './utils/parse-utils';

require('!style!css!postcss!../styles/app.css');

@Component({
  selector: 'bt-app',
  providers: [ParseUtils],
  directives: [TreeView, InfoPanel, AppTrees, Header],
  template: `
    <div *ngIf="treeRef"
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
            [changedNodes]="changedNodes"
            [selectedTabIndex]="selectedTabIndex"
            [selectedNode]="selectedNode"
            [routerTree]="routerTree"
            [theme]="theme"
            [tree]="treeRef"
            [allowedComponentTreeDepth]="3"
            (tabChange)="tabChange($event)">
          </bt-app-trees>
        </div>
        <div class="col col-6 overflow-hidden"
          [ngClass]="{'flex': selectedTabIndex === 0}"
          [hidden]="selectedTabIndex > 0">
          <bt-info-panel
            class="flex flex-column flex-auto bg-white"
            [tree]="treeRef"
            [theme]="theme"
            [node]="selectedNode">
          </bt-info-panel>
        </div>
      </div>
    </div>
    <template [ngIf]="exception">
      <pre>{{exception}}</pre>
    </template>
  `
})
class App {
  private tree: MutableTree;
  private selectedNode: Node;
  private changedNodes = new Array<Node>();
  private selectedTabIndex = 0;
  private searchDisabled: boolean = false;
  private theme: string;
  private initialized = false;
  private exception: string;

  constructor(
    private changeDetector: ChangeDetectorRef,
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

  private get treeRef(): Array<Node> {
    if (this.tree == null) {
      return null;
    }

    return [this.tree.root];
  }

  private ngOnInit() {
    this.connection.connect();

    this.connection.subscribe(this.onReceiveMessage.bind(this));;

    this.connection.send(MessageFactory.initialize())
      .then(() => {
        this.initialized = true;
        this.changeDetector.detectChanges();
      })
      .catch(error => {
        this.exception = error.stack;
        this.changeDetector.detectChanges();
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
    const processed = () => {
      sendResponse(MessageFactory.response(msg, {processed: true}));
      this.changeDetector.detectChanges();
    }

    switch (msg.messageType) {
      case MessageType.CompleteTree:
        this.tree = createTree(deserialize(msg.content));
        processed();
        break;
      case MessageType.TreeDiff:
        if (this.tree == null) {
          this.connection.send(MessageFactory.initialize()); // request tree
        }
        else {
          this.tree.patch(deserialize(msg.content));
        }
        processed();
        break;
    }
  }
}

bootstrap(App, [
  Connection,
  UserActions,
]);
