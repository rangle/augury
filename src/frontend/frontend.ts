import {
  ChangeDetectorRef,
  Component,
  NgZone,
  NgModule,
  enableProdMode,
} from '@angular/core';

import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {FormsModule} from '@angular/forms';

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
  ComponentLoadState,
  ComponentInstanceState,
  ViewState,
  Options,
  Tab,
  Theme,
} from './state';

import {Connection} from './channel/connection';
import {UserActions} from './actions/user-actions/user-actions';
import {TreeView} from './components/tree-view/tree-view';
import {InfoPanel} from './components/info-panel/info-panel';
import AppTrees from './components/app-trees/app-trees';
import {Header} from './components/header/header';
import {SplitPane} from './components/split-pane/split-pane';
import {ParseUtils} from './utils/parse-utils';
import {Route} from '../backend/utils';

require('!style!css!postcss!../styles/app.css');

@Component({
  selector: 'bt-app',
  providers: [ParseUtils],
  directives: [AppTrees, Header, InfoPanel, SplitPane, TreeView],
  template: require('./frontend.html'),
  styles: [require('to-string!./frontend.css')],
})
class App {
  private Tab = Tab;
  private Theme = Theme;
  private selectedTab: Tab = Tab.ComponentTree;
  private theme: Theme;
  private tree: MutableTree;
  private routerTree: Array<Route>;
  private routerException: string;
  private selectedNode: Node;
  private changedNodes = new Array<Node>();
  private componentState: ComponentInstanceState;
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
    this.componentState = new ComponentInstanceState(changeDetector);

    this.options.changes.subscribe(() => this.requestTree());

    this.options.load()
      .then(() => this.changeDetector.detectChanges());

    this.viewState.changes.subscribe(() => this.changeDetector.detectChanges());
  }

  private ngDoCheck() {
    this.selectedNode = this.viewState.selectedTreeNode(this.tree);
  }

  private ngOnInit() {
    this.connection.connect();

    this.connection.subscribe(this.onReceiveMessage.bind(this));;

    this.requestTree();
  }

  private ngOnDestroy() {
    this.connection.close();
  }

  private requestTree() {
    const cleanOptions = {
      showElements: this.options.showElements,
    };

    this.connection.send(MessageFactory.initialize(cleanOptions))
      .then(() => {
        this.changeDetector.detectChanges();
      })
      .catch(error => {
        this.exception = error.stack;
        this.changeDetector.detectChanges();
      });
  }

  private restoreSelection() {
    this.selectedNode = this.viewState.selectedTreeNode(this.tree);

    this.onComponentSelectionChange(this.selectedNode);
  }

  private processMessage(msg: Message<any>,
      sendResponse: (response: MessageResponse<any>) => void) {
    const respond = () => {
      sendResponse(MessageFactory.response(msg, {processed: true}, false));
    };

    switch (msg.messageType) {
      case MessageType.CompleteTree:
        this.componentState.reset();
        this.tree = createTree(msg.content);
        this.restoreSelection();
        respond();
        break;
      case MessageType.TreeDiff:
        if (this.tree == null) {
          this.connection.send(MessageFactory.initialize(this.options)); // request tree
        }
        else {
          const changes = msg.content;
          this.componentState.reset(extractIdentifiersFromChanges(changes));
          this.tree.patch(changes);
          this.restoreSelection();
        }
        respond();
        break;
      case MessageType.RouterTree: // TODO(cbond): support router tree diff
        this.routerTree = msg.content;
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

  private onComponentSelectionChange(node: Node) {
    this.selectedNode = node;

    if (node == null) {
      return;
    }

    /// If this is an Angular component, attempt to retrieve the componentInstance value
    if (this.componentState.has(node)) { // cached?
      this.userActions.selectComponent(node, false);
    }
    else {
      if (node.isComponent) {
        this.componentState.wait(node,
          this.userActions.selectComponent(node, true));
      }
      else {
        this.userActions.selectComponent(node, false);
        this.componentState.write(node, ComponentLoadState.Received, null);
      }
    }
  }

  private onInspectElement(node: Node) {
    chrome.devtools.inspectedWindow.eval(
      `inspect(window.pathLookupNode('${node.id}'))`);
  }

  private onSelectedTabChange(tab: Tab) {
    this.selectedTab = tab;

    switch (tab) {
      case Tab.ComponentTree:
        break;
      case Tab.RouterTree:
        this.connection.send<Route[], any>(MessageFactory.routerTree())
          .then(response => {
            this.routerTree = response;
            this.changeDetector.detectChanges();
          })
          .catch(error => {
            this.routerException = error.stack;
            this.changeDetector.detectChanges();
          });
        break;
      default:
        throw new Error(`Unknown tab: ${tab}`);
    }
  }
}

const extractIdentifiersFromChanges = changes => {
  const extract = (node: Array<Node> | Node) => {
    if (Array.isArray(node)) {
      return node.reduce((p, c) => p.concat([c.id].concat(extract(c.children))), []);
    }
    else {
      return [node.id].concat((node.children || []).map(c => extract(c)));
    }
  }

  return changes.reduce((p, c) => p.concat(extract(c.value)), []);
}

@NgModule({
  declarations: [App],
  imports: [BrowserModule, FormsModule],
  providers: [
    Connection,
    UserActions,
    ViewState,
    Options,
  ],
  bootstrap: [App]
})
class FrontendModule {}

declare const PRODUCTION: boolean;
if (PRODUCTION) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(FrontendModule);
