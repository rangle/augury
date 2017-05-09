import {
  ChangeDetectorRef,
  Component,
  NgZone,
  ErrorHandler,
} from '@angular/core';

import {UncaughtErrorHandler} from './utils/uncaught-error-handler';
import {reportUncaughtError} from '../utils/error-handling';

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
  ExpandState,
  Options,
  Tab,
  Theme,
  ComponentViewState,
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
import {UserActions} from './actions/user-actions/user-actions';
import {Route} from '../backend/utils';

require('!style!css!postcss!../styles/app.css');

@Component({
  selector: 'bt-app',
  template: require('./app.html'),
  styles: [require('to-string!./app.css')],
})
export class App {
  private Tab = Tab;
  private Theme = Theme;

  private componentState: ComponentInstanceState;
  private routerTree: Array<Route>;
  private ngModules: Array<any> = null;
  private selectedNode: Node;
  private selectedTab: Tab = Tab.ComponentTree;
  private subscription: Subscription;
  private tree: MutableTree;
  private error: ApplicationError = null;
  private activateDOMSelection: boolean = false;
  private unsubscribeUncaughtErrorListener;

  constructor(private changeDetector: ChangeDetectorRef,
              private connection: Connection,
              private directConnection: DirectConnection,
              private options: Options,
              private userActions: UserActions,
              private viewState: ComponentViewState,
              private zone: NgZone,
              private errorHandler: ErrorHandler) {

    // this should be our special ErrorHandler subclass which we can listen to
    if (this.errorHandler instanceof UncaughtErrorHandler) {
      this.unsubscribeUncaughtErrorListener = (<UncaughtErrorHandler>this.errorHandler)
        .addListener((err: Error) => {
          this.error = new ApplicationError(ApplicationErrorType.UncaughtException, err);
        });
    }

    this.componentState = new ComponentInstanceState(changeDetector);

    this.options.changes.subscribe(() => this.requestTree());

    this.options.load().then(() => this.changeDetector.detectChanges());

    this.viewState.changes.subscribe(() => this.changeDetector.detectChanges());
  }

  private hasContent() {
    return this.tree &&
      this.tree.roots &&
      this.tree.roots.length > 0;
  }

  private ngDoCheck() {
    this.selectedNode = this.viewState.selectedTreeNode(this.tree);
    this.changeDetector.detectChanges();
  }

  private ngOnInit() {
    this.subscription = this.connection.subscribe(this.onReceiveMessage.bind(this));

    this.connection.reconnect().then(() => this.requestTree());
  }

  private ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.unsubscribeUncaughtErrorListener) {
      this.unsubscribeUncaughtErrorListener();
    }

    this.connection.close();
  }

  private requestTree() {
    const options = this.options.simpleOptions();

    this.connection.send(MessageFactory.initialize(options))
      .catch(error => {
        this.error = new ApplicationError(
          ApplicationErrorType.UncaughtException,
          error);

        this.changeDetector.detectChanges();
      });
  }

  private restoreSelection() {
    this.selectedNode = this.viewState.selectedTreeNode(this.tree);

    this.onSelectNode(this.selectedNode, () => this.componentState.reset());
  }

  private processMessage(msg: Message<any>,
                         sendResponse: (response: MessageResponse<any>) => void) {
    const respond = () => {
      sendResponse(MessageFactory.response(msg, {processed: true}, false));
    };

    switch (msg.messageType) {
      case MessageType.Ping:
        respond();
        break;
      case MessageType.NotNgApp:
        this.error = new ApplicationError(ApplicationErrorType.NotNgApp);
        respond();
        break;
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
      case MessageType.NgModules:
        this.ngModules = msg.content;
        respond();
        break;
      case MessageType.FindElement:
        if (msg.content.node) {
          this.viewState.select(msg.content.node);
          this.viewState.expandState(msg.content.node, ExpandState.Expanded);
          this.activateDOMSelection = true;
          if (msg.content.stop) {
            this.userActions.cancelFindElement();
            this.activateDOMSelection = false;
          }
          break;
        }
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

    this.zone.run(() => this.processMessage(msg, sendResponse));
  }

  private onSelectNode(node: Node, beforeLoad?: () => void) {
    this.selectedNode = node;

    if (node == null) {
      this.viewState.unselect();
      return;
    }

    this.viewState.select(node);

    const m = MessageFactory.selectComponent(node, node.isComponent);

    const promise = this.directConnection.handleImmediate(m)
      .then(response => {
        if (typeof beforeLoad === 'function') {
          beforeLoad();
        }

        const {
          instance,
          metadata,
          providers,
          componentMetadata,
        } = response;

        return {
          instance,
          providers,
          metadata: new Map(metadata),
          componentMetadata: new Map(componentMetadata),
        };
      });

    this.componentState.wait(node, promise);
  }

  private onInspectElement(node: Node) {
    chrome.devtools.inspectedWindow.eval(`inspect(inspectedApplication.nodeFromPath('${node.id}'))`);
  }

  private onCollapseChildren(node: Node) {
    this.recursiveExpansionState(node, ExpandState.Collapsed);
  }

  private onExpandChildren(node: Node) {
    this.recursiveExpansionState(node, ExpandState.Expanded);
  }

  private onReportError() {
    if (this.error && this.error.errorType === ApplicationErrorType.UncaughtException) {
      reportUncaughtError(this.error.error);
      this.error = null;
      // this.requestTree();
    }
  }

  private onSelectedTabChange(tab: Tab) {
    this.selectedTab = tab;
    this.routerTree = this.routerTree ? [].concat(this.routerTree) : null;
  }

  private onDOMSelectionChange(state: boolean) {
    this.activateDOMSelection = state;
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

  private recursiveExpansionState(from: Node, state: ExpandState) {
    const apply = (node: Node) => {
      this.viewState.expandState(node, state);

      node.children.forEach(n => apply(n));
    };

    apply(from);
  }
}
