import {
  Component,
  NgZone,
  EventEmitter,
  Output,
  ElementRef,
  Input,
  Query,
  ViewChild
} from '@angular/core';

import {Search} from '../search/search';
import {UserActions} from '../../actions/user-actions/user-actions';
import {
  MutableTree,
  Node,
} from '../../../tree';
import {
  ComponentView,
  Options,
  Tab,
  Theme,
} from '../../state';

type Route = any; // TODO(cbond): use real Route type

@Component({
  selector: 'augury-header',
  template: require('./header.html'),
  host: {
    '(document:click)': 'resetIfSettingOpened($event)'
  },
  directives: [
    Search,
  ]
})
export class Header {
  @ViewChild('menuElement') private menuElement: ElementRef;
  @ViewChild('menuButtonElement') private menuButtonElement: ElementRef;

  @Input() private selectedTab: Tab;
  @Input() private options: Options;
  @Input() private tree: MutableTree;
  @Input() private routerTree: Array<Route>;

  /// Search has resulted in a new node being selected
  @Output() private selectNode = new EventEmitter<Node>();

  /// Search has resulted in a new route being selected
  @Output() private selectRoute = new EventEmitter<Route>();

  @ViewChild(Search) private search: Search;

  private ComponentView = ComponentView;
  private Tab = Tab;
  private Theme = Theme;

  private settingOpened: boolean = false;

  constructor(private userActions: UserActions) {}

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

  private ngOnChanges(changes) {
    if (this.search == null) {
      return;
    }

    const func = changes.hasOwnProperty('selectedTab')
      ? this.search.reset
      : this.search.reload;

    func.call(this.search);
  }

  private get searchPlaceholder(): string {
    switch (this.selectedTab) {
      case Tab.ComponentTree:
        return 'Search components';
      case Tab.RouterTree:
        return 'Search router';
      default:
        throw new Error(`Unknown tab: ${this.selectedTab}`);
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

  private onRetrieveSearchResults = (query: string): Promise<Array<any>> => {
    switch (this.selectedTab) {
      case Tab.ComponentTree:
        return this.userActions.searchComponents(this.tree, query);
      case Tab.RouterTree:
        return this.userActions.searchRouter(this.routerTree, query);
      default:
        throw new Error(`Unknown tab: ${this.selectedTab}`);
    }
  }

  private onSelectedSearchResultChanged(node: Node | Route) {
    switch (this.selectedTab) {
      case Tab.ComponentTree:
        this.selectNode.emit(<Node> node);
        break;
      case Tab.RouterTree:
        this.selectRoute.emit(<Route> node);
        break;
      default:
        throw new Error(`Unknown tab: ${this.selectedTab}`);
    }
  }
}
