import {NgModule, ErrorHandler, enableProdMode} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

// diagnostic-tools
import {
  DiagActions,
  DiagService,
  DIAG_COMPONENTS,
} from '../diagnostic-tools/frontend';

import {Accordion} from './components/accordion/accordion';
import {AppTrees} from './components/app-trees/app-trees';
import {ComponentInfo} from './components/component-info/component-info';
import {ComponentTree} from './components/component-tree/component-tree';
import {DependencyInfo} from './components/dependency-info/dependency-info';
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
import {SplitPane} from './components/split-pane/split-pane';
import {StateValues} from './components/state-values/state-values';
import {TabMenu} from './components/tab-menu/tab-menu';
import {ComponentsTabMenu} from './components/components-tab-menu/components-tab-menu';
import {TreeView} from './components/tree-view/tree-view';
import {RenderError} from './components/render-error/render-error';
import {ReportError} from './components/report-error/report-error';
import {InfoPanel} from './components/info-panel/info-panel';
import {UserActions} from './actions/user-actions/user-actions';
import {MainActions} from './actions/main-actions';
import {NgModuleInfo} from './components/ng-module-info/ng-module-info';
import {NgModuleConfigView} from './components/ng-module-config-view/ng-module-config-view';

import reduxLogger from 'redux-logger';
import {createEpicMiddleware} from 'redux-observable';
import {SendAnalytics} from './middleware/send-analytics';

import {
  applyMiddleware,
  combineReducers,
  compose,
  createStore,
  Store,
} from 'redux';

import {NgReduxModule, NgRedux} from '@angular-redux/store';
import {rootReducer} from './store/reducers';
import {rootEpic} from './epics';

import {AnalyticsPopup} from './components/analytics-popup/analytics-popup';

import {UncaughtErrorHandler} from './utils/uncaught-error-handler';
import {IAppState} from './store/model';

import {
  Connection,
  DirectConnection,
} from './channel';

import {
  ComponentViewState,
  ComponentPropertyState,
  Options,
} from './state';

import {App} from './app';

declare const PRODUCTION: boolean;

const storedOptionsService = new Options();

storedOptionsService.load()
.then(() => {

  @NgModule({
    imports: [
      BrowserModule,
      CommonModule,
      FormsModule,
      NgReduxModule,
    ],
    declarations: [
      Accordion,
      App,
      AppTrees,
      ComponentInfo,
      ComponentTree,
      DependencyInfo,
      InfoPanel,
      InjectorTree,
      NodeAttributes,
      NodeItem,
      NodeOpenTag,
      PropertyEditor,
      PropertyValue,
      RenderError,
      ReportError,
      RouterInfo,
      RenderState,
      RouterTree,
      Search,
      SplitPane,
      StateValues,
      TabMenu,
      ComponentsTabMenu,
      TreeView,
      NgModuleInfo,
      NgModuleConfigView,
      AnalyticsPopup,
      ...DIAG_COMPONENTS,
    ],
    providers: [
      Connection,
      DirectConnection,
      { provide: Options, useValue: storedOptionsService },
      UserActions,
      MainActions,
      ComponentViewState,
      ComponentPropertyState,
      SendAnalytics,
      { provide: ErrorHandler, useClass: UncaughtErrorHandler },
      DiagActions,
      DiagService,
    ],
    bootstrap: [App]
  })
  class FrontendModule {
    constructor(
      ngRedux: NgRedux<IAppState>,
      sendAnalytics: SendAnalytics) {
      const store = createStore(
        rootReducer,
        compose(applyMiddleware(reduxLogger),
          applyMiddleware(createEpicMiddleware(rootEpic)),
          applyMiddleware(sendAnalytics.middleware)));

      ngRedux.provideStore(store as Store<IAppState>);
    }
  }

  if (PRODUCTION) {
    enableProdMode();
  }

  platformBrowserDynamic().bootstrapModule(FrontendModule);

});
