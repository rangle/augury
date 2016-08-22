import {
  Component,
  NgZone,
  EventEmitter,
  Output,
  ElementRef,
  Input
} from '@angular/core';

import {UserActions} from '../../actions/user-actions/user-actions';

import {
  Options,
  Theme,
} from '../../state';

@Component({
  selector: 'augury-header',
  template: require('./header.html'),
  host: {
    '(document:click)': 'resetIfSettingOpened($event)'
  }
})
export class Header {
  private Theme = Theme;

  @Input() private options: Options;

  private searchIndex: number = 0;
  private totalSearchCount: number = 0;
  private query: string = '';
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

  onOpenSettings() {
    this.settingOpened = !this.settingOpened;
  }

  onThemeChange(theme: Theme, selected: boolean) {
    if (selected) {
      this.options.theme = theme;
    }

    this.resetTheme();
  }

  onKey(event, isNext) {
    if (this.query.length === 0) {
      return;
    }

    if (isNext === undefined && event.keyCode === 13) {
      this.searchIndex++;
    } else if (isNext === undefined) {
      this.searchIndex = 0;
    } else if (isNext) {
      this.searchIndex++;
    } else if (!isNext) {
      this.searchIndex--;
    }

    // cycle over the search results if reached at the end
    if (this.searchIndex === this.totalSearchCount) {
      this.searchIndex = 0;
    } else if (this.searchIndex < 0) {
      this.searchIndex = this.totalSearchCount - 1;
    }

    this.query = this.query.toLocaleLowerCase();

    this.userActions.searchNode(this.query, this.searchIndex);

    this.ngZone.run(() => undefined);
  }
}
