import {
  Component,
  NgZone,
  EventEmitter,
  Output,
  ElementRef,
  Input
} from '@angular/core';

import {Search} from '../search/search';
import {UserActions} from '../../actions/user-actions/user-actions';
import {
  Options,
  Tab,
  Theme,
} from '../../state';

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
  private Tab = Tab;
  private Theme = Theme;

  @Input() private selectedTab: Tab;

  @Input() private options: Options;

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
        return this.userActions.searchComponents(query);
      case Tab.RouterTree:
        return this.userActions.searchRouter(query);
      default:
        throw new Error(`Unknown tab: ${this.selectedTab}`);
    }
  }
}
