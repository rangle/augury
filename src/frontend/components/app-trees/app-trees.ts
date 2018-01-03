import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

import {Route} from '../../../backend/utils';
import {TabDescription} from '../tab-menu/tab-menu';
import {
  ComponentInstanceState,
  ComponentView,
  Options,
  Tab,
  StateTab,
  Theme,
  AnalyticsConsent,
} from '../../state';

import {Path} from '../../../tree';

type Node = any;

@Component({
  selector: 'bt-app-trees',
  template: require('./app-trees.html'),
  host: {
    '(document:click)': 'resetIfSettingOpened($event)'
  },
  styles: []
})
export class AppTrees {
  private ComponentView = ComponentView;
  private Tab = Tab;
  private Theme = Theme;
  private AnalyticsConsent = AnalyticsConsent;
  private showFeedbackPane: boolean = false;

  @Input() private ngVersion: String;
  @Input() private componentState: ComponentInstanceState;
  @Input() private options: Options;
  @Input() private routerTree: Array<Route>;
  @Input() private tree: Array<Node>;
  @Input() private ngModules: {[key: string]: any};

  @Input() private selectedNode: Node;
  @Input() private selectedRoute: Route;
  @Input() private selectedTab: Tab;
  @Input() private selectedComponentsSubTab: StateTab;
  @Input() private domSelectionActive: boolean;

  @Output() private collapseChildren = new EventEmitter<Node>();
  @Output() private expandChildren = new EventEmitter<Node>();
  @Output() private inspectElement = new EventEmitter<Node>();
  @Output() private selectNode = new EventEmitter<Node>();
  @Output() private tabChange = new EventEmitter<Tab>();
  @Output() private componentsSubTabMenuChange = new EventEmitter<StateTab>();

  @Output() private domSelectionActiveChange = new EventEmitter<boolean>();

  @Output() private emitValue = new EventEmitter<{path: Path, data: any}>();
  @Output() private updateProperty = new EventEmitter<{path: Path, newValue: any}>();

  @ViewChild('splitPane') private splitPane;
  @ViewChild('menuButtonElement') private menuButtonElement;
  @ViewChild('menuElement') private menuElement;

  private settingOpened: boolean = false;
  private showAnalyticsConsent: boolean = false;

  private tabs: Array<TabDescription> = [{
    title: 'Component Tree',
    tab: Tab.ComponentTree,
  }, {
    title: 'Router Tree',
    tab: Tab.RouterTree,
  }, {
    title: 'NgModules',
    tab: Tab.NgModules,
  }];

  private ngOnInit() {
    this.options.load().then((results) => {
      if (results.analyticsConsent === AnalyticsConsent.NotSet) {
        this.showAnalyticsConsent = true;
      }
    });
  }

  onTabSelectionChanged(index: number) {
    this.splitPane.handleTabNavigation();
    this.tabChange.emit(this.tabs[index].tab);
  }

  onDOMSelectionActiveChange(state: boolean) {
    this.domSelectionActiveChange.emit(state);
  }

  reset() {
    this.settingOpened = false;
  }

  resetIfSettingOpened(event) {
    if (this.menuElement && this.menuButtonElement &&
        !(this.menuElement.nativeElement.contains(event.target) ||
          this.menuButtonElement.nativeElement.contains(event.target))) {
      this.reset();
    }
  }

  private onOpenSettings = () => {
    this.settingOpened = !this.settingOpened;
  }

  private onFeedbackClick = () => {
    this.showFeedbackPane = !this.showFeedbackPane;
  }

  private onReportIssuesClick = () => {
    const date = (new Date()).toUTCString();
    const body = `Augury: ${chrome.runtime.getManifest().version}
    Date: ${date}
    OS: ${navigator.platform}

    Demo Test Application:
    -- Git repository for demo app showing the issue (optional but very helpful for difficult issues.)
    -- If a code snippet will completely show the issue, please include it.

    Description of issue:
    -- Include (clipped) screenshot images if possible.

    Angular Version (required): ${this.ngVersion ? this.ngVersion : '???'}

    Steps to reproduce:

    1.
    2.
    3.

    Additional Details:

    `;
    window.open(`https://github.com/rangle/augury/issues/new?body=${(<any>window).encodeURI(body)}`);
  }

  private onThemeChange = (theme: Theme) => {
    this.options.theme = theme;
    this.reset();
  }

  private onComponentViewChanged = (view: ComponentView) => {
    this.options.componentView = view;
    this.reset();
  }

  private onAnalyticsConsentChange = (analyticsConsent: AnalyticsConsent) => {
    this.options.analyticsConsent = analyticsConsent;
    this.reset();
  }

  private onHideAnalyticsPopup = () => {
    this.showAnalyticsConsent = false;
  }
}
