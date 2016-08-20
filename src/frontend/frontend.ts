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

import {deserialize} from '../utils';

import {
  ViewState,
  Options,
  Tab,
  Theme,
} from './state';

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
      [ngClass]="{'dark': theme === Theme.Dark}">
      <augury-header
        [theme]="theme"
        (newTheme)="options.theme = $event">
      </augury-header>
      <div class="flex flex-auto">
        <div class="col col-6 overflow-hidden
          border-right border-color-dark flex"
        [ngClass]="{'overflow-scroll col-12': selectedTab === Tab.RouterTree}">
          <bt-app-trees #trees
            class="flex flex-column flex-auto bg-white"
            [changedNodes]="changedNodes"
            [selectedTab]="selectedTab"
            [selectedNode]="selectedNode"
            [routerTree]="routerTree"
            [theme]="theme"
            [tree]="treeRef"
            (tabChange)="selectedTab = $event">
          </bt-app-trees>
        </div>
        <div class="col col-6 overflow-hidden"
          [ngClass]="{'flex': selectedTab === Tab.ComponentTree}"
          [hidden]="selectedTab !== Tab.ComponentTree">
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
  `,
  styles: [require('to-string!./frontend.css')],
})
class App {
  private Tab = Tab;
  private Theme = Theme;
  private selectedTab: Tab = Tab.ComponentTree;
  private theme: Theme;
  private tree: MutableTree;
  private selectedNode: Node;
  private changedNodes = new Array<Node>();
  private exception: string;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private connection: Connection,
    private ngZone: NgZone,
    private options: Options,
    private parseUtils: ParseUtils,
    private userActions: UserActions,
    private viewState: ViewState
  ) {
    this.options.getTheme().then(theme => {
      this.theme = theme;
      this.changeDetector.detectChanges();
    });

    this.viewState.changes.subscribe(() => this.changeDetector.detectChanges());
  }

  private get treeRef(): Array<Node> {
    return this.tree == null
      ? null
      : [this.tree.root];
  }

  private ngOnInit() {
    debugger;

    this.connection.connect();

    this.connection.subscribe(this.onReceiveMessage.bind(this));;

    this.connection.send(MessageFactory.initialize())
      .then(() => {
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

  private processMessage(msg: Message<any>,
      sendResponse: (response: MessageResponse<any>) => void) {
    const respond = () => {
      sendResponse(MessageFactory.response(msg, {processed: true}));
    };

    switch (msg.messageType) {
      case MessageType.CompleteTree:
        this.tree = createTree(deserialize(msg.content));
        respond();
        break;
      case MessageType.TreeDiff:
        if (this.tree == null) {
          this.connection.send(MessageFactory.initialize()); // request tree
        }
        else {
          this.tree.patch(deserialize(msg.content));
        }
        respond();
        break;
    }
  }

  private onReceiveMessage(msg: Message<any>,
      sendResponse: (response: MessageResponse<any>) => void) {
    try {
      this.processMessage(msg, sendResponse);
    }
    catch (error) {
      this.exception = error.stack;
    }
    finally {
      this.changeDetector.detectChanges();
    }
  }
}

bootstrap(App, [
  Connection,
  UserActions,
  ViewState,
  Options,
]);
