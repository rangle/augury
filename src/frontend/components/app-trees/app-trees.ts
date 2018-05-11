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
import {DiagService} from 'diagnostic-tools/frontend';

type Node = any;

@Component({
  selector: 'bt-app-trees',
  templateUrl: './app-trees.html',
  host: {
    '(document:click)': 'resetIfSettingOpened($event)'
  },
  styles: [`
    .ngVersion {
      line-height: 31px;
      font-weight: bold;
      color: #5128a5;
      padding-right: 5px;
    }
    .enable-troubleshooting {
      margin-left: 2em;
      line-height: 31px;
      font-weight: bold;
      padding-right: 5px;
    }
  `]
})
export class AppTrees {

  ComponentView = ComponentView;
  Tab = Tab;
  Theme = Theme;
  AnalyticsConsent = AnalyticsConsent;

  @Input() ngVersion: String;
  @Input() componentState: ComponentInstanceState;
  @Input() options: Options;
  @Input() routerTree: Array<Route>;
  @Input() tree: Array<Node>;
  @Input() ngModules: {[key: string]: any};

  @Input() selectedNode: Node;
  @Input() selectedRoute: Route;
  @Input() selectedTab: Tab;
  @Input() selectedComponentsSubTab: StateTab;
  @Input() domSelectionActive: boolean;

  @Output() collapseChildren = new EventEmitter<Node>();
  @Output() expandChildren = new EventEmitter<Node>();
  @Output() inspectElement = new EventEmitter<Node>();
  @Output() selectNode = new EventEmitter<Node>();
  @Output() tabChange = new EventEmitter<Tab>();
  @Output() componentsSubTabMenuChange = new EventEmitter<StateTab>();

  @Output() domSelectionActiveChange = new EventEmitter<boolean>();

  @Output() emitValue = new EventEmitter<{path: Path, data: any}>();
  @Output() updateProperty = new EventEmitter<{path: Path, newValue: any}>();

  @ViewChild('splitPane') private splitPane;
  @ViewChild('menuButtonElement') private menuButtonElement;
  @ViewChild('menuElement') private menuElement;

  settingOpened: boolean = false;
  showAnalyticsConsent: boolean = false;

  tabs = (): Array<TabDescription> => [{
    title: 'Component Tree',
    tab: Tab.ComponentTree,
  }, {
    title: 'Router Tree',
    tab: Tab.RouterTree,
  }, {
    title: 'NgModules',
    tab: Tab.NgModules,
  }].concat(
    this.diagService.enabled() ?
      [{
        title: 'Troubleshooting',
        tab: Tab.DiagnosticTools,
      }]
    : []
  );

  DEFAULT_TAB: Tab = Tab.ComponentTree;
  getActiveTab = (): Tab =>
    this.tabs()
      .find((td: TabDescription) => td.tab === this.selectedTab)
      ? this.selectedTab
      : this.DEFAULT_TAB;

  constructor(
    private diagService: DiagService
  ){}

  private ngOnInit() {
    this.options.load().then((results) => {
      if (results.analyticsConsent === AnalyticsConsent.NotSet) {
        this.showAnalyticsConsent = true;
      }
    });
  }

  onTabSelectionChanged(index: number) {
    this.splitPane.handleTabNavigation();
    this.tabChange.emit(this.tabs()[index].tab);
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

  onOpenSettings = () => {
    this.settingOpened = !this.settingOpened;
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

  private onDiagnosticToolsToggle = (value: boolean) => {
    if (value) {
      this.diagService.enable();
      this.onTabSelectionChanged(Tab.DiagnosticTools);
    } else {
      this.diagService.disable();
      if (this.getActiveTab() === Tab.DiagnosticTools) 
        this.onTabSelectionChanged(Tab.ComponentTree);
    }
    this.reset();
  }

  private onHideAnalyticsPopup = () => {
    this.showAnalyticsConsent = false;
  }
}
