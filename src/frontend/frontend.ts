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
  ComponentLoadState,
  ComponentInstanceState,
  ViewState,
  Options,
  Tab,
  Theme,
} from './state';

import {Connection} from './channel/connection';
import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {UserActions} from './actions/user-actions/user-actions';
import {TreeView} from './components/tree-view/tree-view';
import {InfoPanel} from './components/info-panel/info-panel';
import AppTrees from './components/app-trees/app-trees';
import {Header} from './components/header/header';
import {ParseUtils} from './utils/parse-utils';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';

require('!style!css!postcss!../styles/app.css');

@Component({
  selector: 'bt-app',
  providers: [ParseUtils],
  directives: [TreeView, InfoPanel, AppTrees, Header],
  template: require('./frontend.html'),
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

    this.onSelectionChange(this.selectedNode);
  }

  private processMessage(msg: Message<any>,
      sendResponse: (response: MessageResponse<any>) => void) {
    const respond = () => {
      sendResponse(MessageFactory.response(msg, {processed: true}, false));
    };

    switch (msg.messageType) {
      case MessageType.CompleteTree:
        this.componentState.reset();
        this.tree = createTree(deserialize(msg.content));
        this.restoreSelection();
        respond();
        break;
      case MessageType.TreeDiff:
        if (this.tree == null) {
          this.connection.send(MessageFactory.initialize(this.options)); // request tree
        }
        else {
          const changes = deserialize(msg.content);
          this.componentState.reset(extractIdentifiersFromChanges(changes));
          this.tree.patch(changes);
          this.restoreSelection();
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

  private onSelectionChange(node: Node) {
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
    debugger;
    // FIXME(cbond): Find a better way to inspect the element without augury-id
    // chrome.devtools.inspectedWindow.eval(`inspect()`);
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
