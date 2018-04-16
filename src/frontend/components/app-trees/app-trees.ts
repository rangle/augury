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
  `]
})
export class AppTrees {
  private ComponentView = ComponentView;
  Tab = Tab;
  private Theme = Theme;
  private AnalyticsConsent = AnalyticsConsent;

  @Input() ngVersion: String;
  @Input() componentState: ComponentInstanceState;
  @Input() private options: Options;
  @Input() routerTree: Array<Route>;
  @Input() tree: Array<Node>;
  @Input() ngModules: {[key: string]: any};

  @Input() selectedNode: Node;
  @Input() private selectedRoute: Route;
  @Input() selectedTab: Tab;
  @Input() selectedComponentsSubTab: StateTab;
  @Input() domSelectionActive: boolean;

  @Output() collapseChildren = new EventEmitter<Node>();
  @Output() expandChildren = new EventEmitter<Node>();
  @Output() inspectElement = new EventEmitter<Node>();
  @Output() selectNode = new EventEmitter<Node>();
  @Output() private tabChange = new EventEmitter<Tab>();
  @Output() componentsSubTabMenuChange = new EventEmitter<StateTab>();

  @Output() private domSelectionActiveChange = new EventEmitter<boolean>();

  @Output() emitValue = new EventEmitter<{path: Path, data: any}>();
  @Output() updateProperty = new EventEmitter<{path: Path, newValue: any}>();

  @ViewChild('splitPane') private splitPane;
  @ViewChild('menuButtonElement') private menuButtonElement;
  @ViewChild('menuElement') private menuElement;

  settingOpened: boolean = false;
  showAnalyticsConsent: boolean = false;

  tabs: Array<TabDescription> = [{
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

  private onHideAnalyticsPopup = () => {
    this.showAnalyticsConsent = false;
  }
}
