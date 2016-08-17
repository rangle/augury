import {bootstrap} from '@angular/platform-browser-dynamic';
import {
  Component,
  NgZone,
} from '@angular/core';

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
    <div class="clearfix vh-100 overflow-hidden flex flex-column"
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

  constructor(
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

  tabChange(index: number) {
    this.selectedTabIndex = index;
    if (index === 1) {
      this.userActions.renderRouterTree();
      this.searchDisabled = true;
    } else {
      this.searchDisabled = false;
    }
  }

  themeChanged(newTheme: string): void {
    this.theme = newTheme;
    // Set the new theme
    chrome.storage.sync.set({ theme: newTheme });
  }
}

bootstrap(App, [
  Connection,
  UserActions,
]);
