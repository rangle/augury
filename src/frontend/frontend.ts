import {
  ChangeDetectorRef,
  Component,
  NgModule,
  NgZone,
  enableProdMode,
} from '@angular/core';

import {
  Connection,
  DirectConnection,
} from './channel';

import {
  ApplicationError,
  ApplicationErrorType,
  Message,
  MessageFactory,
  MessageResponse,
  MessageType,
  Subscription,
} from '../communication';

import {
  ComponentInstanceState,
  Options,
  Tab,
  Theme,
  ViewState,
} from './state';

import {
  Change,
  MutableTree,
  Node,
  Path,
  deserializeChangePath,
  serializePath,
} from '../tree';

import {createTree} from '../tree/mutable-tree-factory';
import {deserialize} from '../utils';

import {BrowserModule} from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {UserActions} from './actions/user-actions/user-actions';
import {RenderError} from './components/render-error/render-error';
import {InfoPanel} from './components/info-panel/info-panel';
import {ParseUtils} from './utils/parse-utils';
import {Route} from '../backend/utils';
import {Accordion} from './components/accordion/accordion';
import {AppTrees} from './components/app-trees/app-trees';
import {ComponentInfo} from './components/component-info/component-info';
import {ComponentTree} from './components/component-tree/component-tree';
import {Dependency} from './components/dependency/dependency';
import {Header} from './components/header/header';
import {InjectorTree} from './components/injector-tree/injector-tree';
import {NodeAttributes} from './components/node-item/node-attributes';
import {NodeItem} from './components/node-item/node-item';
import {NodeOpenTag} from './components/node-item/node-open-tag';
import {PropertyEditor} from './components/property-editor/property-editor';
import {PropertyValue} from './components/property-value/property-value';
import {RenderState} from './components/render-state/render-state';
import {RouterInfo} from './components/router-info/router-info';
import {RouterTree} from './components/router-tree/router-tree';
import {Search} from './components/search/search';
import {Spinner} from './components/spinner/spinner';
import {SplitPane} from './components/split-pane/split-pane';
import {StateValues} from './components/state-values/state-values';
import {TabMenu} from './components/tab-menu/tab-menu';
import {TreeView} from './components/tree-view/tree-view';

require('!style!css!postcss!../styles/app.css');

@Component({
  selector: 'bt-app',
  providers: [ParseUtils],
  template: require('./frontend.html'),
  styles: [require('to-string!./frontend.css')],
})
class App {
  private Tab = Tab;
  private Theme = Theme;

  private componentState: ComponentInstanceState;
  private routerTree: Array<Route>;
  private selectedNode: Node;
  private selectedRoute: Route;
  private selectedTab: Tab = Tab.ComponentTree;
  private subscription: Subscription;
  private theme: Theme;
  private tree: MutableTree;
  private error: ApplicationError;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private connection: Connection,
    private directConnection: DirectConnection,
    private options: Options,
    private userActions: UserActions,
    private viewState: ViewState,
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
        this.error = new ApplicationError(
          ApplicationErrorType.UncaughtException,
          error.message,
          error.stack);

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
          this.connection.send(MessageFactory.initialize(this.options.simpleOptions())); // request tree
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
      case MessageType.ApplicationError:
        this.error = msg.content;
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
        this.error = new ApplicationError(
          ApplicationErrorType.UncaughtException,
          error.message,
          error.stack);
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

    const m = MessageFactory.selectComponent(node, node.isComponent);

    if (node.isComponent) {

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
      this.directConnection.handleImmediate(m)
        .then(() => {
          this.componentState.done(node, null);
        });
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
            this.error = new ApplicationError(
              ApplicationErrorType.UncaughtException,
              error.message,
              error.stack);
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

const declarations = [
  Accordion,
  App,
  AppTrees,
  ComponentInfo,
  ComponentTree,
  Dependency,
  Header,
  InfoPanel,
  InjectorTree,
  NodeAttributes,
  NodeItem,
  NodeOpenTag,
  PropertyEditor,
  PropertyValue,
  RenderState,
  RouterInfo,
  RouterTree,
  Search,
  Spinner,
  SplitPane,
  StateValues,
  TabMenu,
  TreeView,
  RenderError,
];

@NgModule({
  declarations,
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
  ],
  providers: [
    Connection,
    DirectConnection,
    Options,
    UserActions,
    ViewState,
  ],
  bootstrap: [App]
})
class FrontendModule {}

declare const PRODUCTION: boolean;
if (PRODUCTION) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(FrontendModule);
