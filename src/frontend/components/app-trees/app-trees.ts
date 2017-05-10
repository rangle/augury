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
  Theme,
} from '../../state';

type Node = any;

@Component({
  selector: 'bt-app-trees',
  template: require('./app-trees.html'),
  host: {
    '(document:click)': 'resetIfSettingOpened($event)'
  },
})
export class AppTrees {
  private ComponentView = ComponentView;
  private Tab = Tab;
  private Theme = Theme;

  @Input() private componentState: ComponentInstanceState;
  @Input() private options: Options;
  @Input() private routerTree: Array<Route>;
  @Input() private tree: Array<Node>;
  @Input() private ngModules: {[key: string]: any};

  @Input() private selectedNode: Node;
  @Input() private selectedRoute: Route;
  @Input() private selectedTab: Tab;
  @Input() private activateDOMSelection: boolean;

  @Output() private collapseChildren = new EventEmitter<Node>();
  @Output() private expandChildren = new EventEmitter<Node>();
  @Output() private inspectElement = new EventEmitter<Node>();
  @Output() private selectNode = new EventEmitter<Node>();
  @Output() private tabChange = new EventEmitter<Tab>();
  @Output() private DOMSelectionChange = new EventEmitter<boolean>();

  @ViewChild('splitPane') private splitPane;
  @ViewChild('menuButtonElement') private menuButtonElement;
  @ViewChild('menuElement') private menuElement;

  private settingOpened: boolean = false;

  private tabs: Array<TabDescription> = [{
    title: 'Component Tree',
    selected: false,
    tab: Tab.ComponentTree,
  }, {
    title: 'Router Tree',
    selected: false,
    tab: Tab.RouterTree,
  }, {
    title: 'NgModules',
    selected: false,
    tab: Tab.NgModules,
  }];

  onTabSelectionChanged(index: number) {
    this.splitPane.handleTabNavigation();
    this.tabChange.emit(this.tabs[index].tab);
  }

  onDOMSelectionChange(state: boolean) {
    this.DOMSelectionChange.emit(state);
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

  private onThemeChange = (theme: Theme) => {
    this.options.theme = theme;
    this.reset();
  }

  private onComponentViewChanged = (view: ComponentView) => {
    this.options.componentView = view;
    this.reset();
  }
}
