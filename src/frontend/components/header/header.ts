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
  @Input() private selectedTab: Tab;
  @Input() private options: Options;
  @Input() private tree: MutableTree;
  @Input() private routerTree: Array<Route>;

  /// Search has resulted in a new node being selected
  @Output() private selectNode = new EventEmitter<Node>();

  /// Search has resulted in a new route being selected
  @Output() private selectRoute = new EventEmitter<Route>();

  @ViewChild(Search) private search: Search;

  private Tab = Tab;

  private Theme = Theme;

  private settingOpened: boolean = false;

  constructor(
    private userActions: UserActions,
    private ngZone: NgZone,
    private elementRef: ElementRef
  ) {}

  resetTheme() {
    this.settingOpened = false;
  }

  resetIfSettingOpened(event) {
    let clickedComponent = event.target;
    if (!clickedComponent) {
      return;
    }
    const menuElement = this.elementRef.nativeElement
      .querySelector('#augury-theme-menu');

    const menuButtonElement = this.elementRef.nativeElement
      .querySelector('#augury-theme-menu-button');

    // If click was not inside menu button or menu, close the menu.
    let inside = (menuElement && menuElement.contains(clickedComponent)) ||
      (menuButtonElement && menuButtonElement.contains(clickedComponent));

    if (!inside) {
      this.resetTheme();
    }
  }

  private ngOnChanges(changes) {
    if (changes.hasOwnProperty('selectedTab')) {
      if (this.search) {
        this.search.reset();
      }
    }
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

  private onThemeChange = (theme: Theme, selected: boolean) => {
    if (selected) {
      this.options.theme = theme;
    }

    this.resetTheme();
  }

  private onRetrieveSearchResults = (query: string) => {
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
