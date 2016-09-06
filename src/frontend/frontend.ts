import {
  ChangeDetectorRef,
  Component,
  NgModule,
  NgZone,
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
  Subscription,
} from '../communication';

import {
  Change,
  MutableTree,
  Node,
  Path,
  deserializeChangePath,
  serializePath,
} from '../tree';

import {createTree} from '../tree/mutable-tree-factory';

import {
  ComponentInstanceState,
  ViewState,
  Options,
  Tab,
  Theme,
} from './state';

import {
  Connection,
  DirectConnection,
} from './channel';

import {deserialize} from '../utils';

import {UserActions} from './actions/user-actions/user-actions';
import {TreeView} from './components/tree-view/tree-view';
import {InfoPanel} from './components/info-panel/info-panel';
import {AppTrees} from './components/app-trees/app-trees';
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

  private tree: MutableTree;
  private routerTree: Array<Route>;
  private routerException: string;
  private componentState: ComponentInstanceState;
  private subscription: Subscription;
  private exception: string;
  private selectedNode: Node;
  private selectedRoute: Route;
  private selectedTab: Tab = Tab.ComponentTree;

  constructor(
    private connection: Connection,
    private directConnection: DirectConnection,
    private options: Options,
    private userActions: UserActions,
    private viewState: ViewState,
    private changeDetector: ChangeDetectorRef,
    private zone: NgZone
  ) {
    this.componentState = new ComponentInstanceState(changeDetector);

    this.options.changes.subscribe(() => this.requestTree());

    this.options.load()
      .then(() => this.changeDetector.detectChanges());

    this.viewState.changes.subscribe(() => this.changeDetector.detectChanges());
  }

  private hasContent() {
    return this.tree &&
           this.tree.roots &&
           this.tree.roots.length > 0;
  }

  private ngDoCheck() {
    this.selectedNode = this.viewState.selectedTreeNode(this.tree);
  }

  private ngOnInit() {
    this.subscription = this.connection.subscribe(this.onReceiveMessage.bind(this));

    this.connection.reconnect().then(() => this.requestTree());
  }

  private ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.connection.close();
  }

  private requestTree() {
    const options = this.options.simpleOptions();

    this.connection.send(MessageFactory.initialize(options))
      .catch(error => {
        this.exception = error.stack;
        this.changeDetector.detectChanges();
      });
  }

  private restoreSelection() {
    this.selectedNode = this.viewState.selectedTreeNode(this.tree);

    this.onComponentSelectionChange(this.selectedNode,
      () => this.componentState.reset());
  }

  private processMessage(msg: Message<any>,
      sendResponse: (response: MessageResponse<any>) => void) {
    const respond = () => {
      sendResponse(MessageFactory.response(msg, {processed: true}, false));
    };

    switch (msg.messageType) {
      case MessageType.Push:
        this.directConnection.readQueue(
          (innerMessage, innerRespond) => this.processMessage(innerMessage, innerRespond));
        break;
      case MessageType.CompleteTree:
        this.createTree(msg.content);
        respond();
        break;
      case MessageType.TreeDiff:
        if (this.tree == null) {
          this.connection.send(MessageFactory.initialize(this.options)); // request tree
        }
        else {
          this.updateTree(msg.content);
        }
        respond();
        break;
      case MessageType.RouterTree: // TODO(cbond): support router tree diff
        this.routerTree = msg.content;
        respond();
        break;
    }
  }

  private createTree(roots: Array<Node>) {
    this.componentState.reset();

    this.tree = createTree(roots);

    this.restoreSelection();
  }

  private updateTree(changes) {
    /// Patch the treee
    this.tree.patch(changes);

    /// This operation must happen after the tree patch
    const changedIdentifiers = this.extractIdentifiersFromChanges(changes);

    /// Highlight the nodes that have changed
    this.viewState.nodesChanged(changedIdentifiers);

    this.restoreSelection();
  }

  private onReceiveMessage(msg: Message<any>,
      sendResponse: (response: MessageResponse<any>) => void) {
    const process = () => {
      try {
        this.processMessage(msg, sendResponse);
      }
      catch (error) {
        this.exception = error.stack;
        throw error;
      }
    };

    this.zone.run(() => process());
  }

  private onComponentSelectionChange(node: Node, beforeLoad?: () => void) {
    this.selectedNode = node;

    if (node == null) {
      this.viewState.unselect();
      return;
    }

    this.viewState.select(node);

    if (node.isComponent) {
      const m = MessageFactory.selectComponent(node, node.isComponent);

      const promise = this.directConnection.handleImmediate(m)
        .then(response => {
          if (typeof beforeLoad === 'function') {
            beforeLoad();
          }
          return response;
        });

      this.componentState.wait(node, promise);
    }
    else {
      this.componentState.done(node, null);
    }
  }

  private onRouteSelectionChange(route: Route) {
    this.selectedRoute = route;
  }

  private onInspectElement(node: Node) {
    chrome.devtools.inspectedWindow.eval(`inspect(inspectedApplication.nodeFromPath('${node.id}'))`);
  }

  private onSelectedTabChange(tab: Tab) {
    this.selectedTab = tab;

    switch (tab) {
      case Tab.ComponentTree:
        break;
      case Tab.RouterTree:
        this.userActions.renderRouterTree()
          .then(response => {
            this.zone.run(() => {
              this.routerTree = response;
            });
          })
          .catch(error => {
            this.zone.run(() => {
              this.routerException = error.stack;
            });
          });
        break;
      default:
        throw new Error(`Unknown tab: ${tab}`);
    }
  }

  private extractIdentifiersFromChanges(changes: Array<Change>): string[] {
    const identifiers = new Set<string>();

    for (const change of changes) {
      const path = this.nodePathFromChangePath(deserializeChangePath(change.path));

      identifiers.add(serializePath(path));
    }

    const results = new Array<string>();

    identifiers.forEach(id => results.push(id));

    return results;
  }

  private nodePathFromChangePath(changePath: Path) {
    const result = new Array<string | number>();

    for (let index = 0; index < changePath.length; ++index) {
      switch (changePath[index]) {
        case 'roots':
        case 'children':
          result.push(changePath[++index]);
          break;
      }
    }

    return result;
  }
}

@NgModule({
  declarations: [App],
  imports: [BrowserModule, FormsModule],
  providers: [
    Connection,
    DirectConnection,
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
