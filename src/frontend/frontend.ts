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
  Change,
  MutableTree,
  Node,
  Path,
  createTree,
  serializePath,
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
  private selectedTab: Tab = Tab.ComponentTree;
  private theme: Theme;
  private tree: MutableTree;
  private routerTree: Array<Route>;
  private routerException: string;
  private selectedNode: Node;
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

    this.connection.subscribe(this.onReceiveMessage.bind(this));

    this.requestTree();
  }

  private ngOnDestroy() {
    this.connection.close();
  }

  private requestTree() {
    const options = this.options.simpleOptions();

    this.connection.send(MessageFactory.initialize(options))
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

    this.onComponentSelectionChange(this.selectedNode, true);
  }

  private processMessage(msg: Message<any>,
      sendResponse: (response: MessageResponse<any>) => void) {
    const respond = () => {
      sendResponse(MessageFactory.response(msg, {processed: true}, false));
    };

    switch (msg.messageType) {
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

    this.changeDetector.detectChanges();
  }

  private updateTree(changes) {
    /// Patch the treee
    this.tree.patch(changes);

    /// This operation must happen after the tree patch
    const changedIdentifiers = this.extractIdentifiersFromChanges(changes);

    /// Highlight the nodes that have changed
    this.viewState.nodesChanged(changedIdentifiers);

    this.restoreSelection();

    this.changeDetector.detectChanges();
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

  private onComponentSelectionChange(node: Node, reset: boolean) {
    this.selectedNode = node;

    if (node == null) {
      return;
    }

    /// If this is an Angular component, attempt to retrieve the componentInstance value
    if (this.componentState.has(node) && reset === false) { // cached?
      this.userActions.selectComponent(node, false);
    }
    else {
      if (node.isComponent) {
        // A bit of a contortion to prevent the UI from flickering when we reload the state
        const promise =
          this.userActions.selectComponent(node, true)
            .then(response => {
              this.componentState.reset();
              return response;
            });

        this.componentState.wait(node, promise);
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
        this.userActions.renderRouterTree()
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

  private extractIdentifiersFromChanges(changes: Array<Change>): string[] {
    const identifiers = new Set<string>();

    for (const change of changes) {
      const path = this.nodePathFromChangePath(change.path.split('/'));

      identifiers.add(serializePath(path));
    }

    const results = new Array<string>();

    identifiers.forEach(id => results.push(id));

    return results;
  }

  private nodePathFromChangePath(changePath: Array<string>) {
    const result = new Array<number>();

    for (let index = 0; index < changePath.length; ++index) {
      switch (changePath[index]) {
        case 'roots':
        case 'children':
          result.push(parseInt(changePath[++index], 10));
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
