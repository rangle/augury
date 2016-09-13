import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

import {
  ComponentView,
  Options,
  Theme,
} from '../../state';

type Route = any; // TODO(cbond): use real Route type

@Component({
  selector: 'augury-header',
  template: require('./header.html'),
  host: {
    '(document:click)': 'resetIfSettingOpened($event)'
  },
})
export class Header {
  @ViewChild('menuElement') private menuElement: ElementRef;
  @ViewChild('menuButtonElement') private menuButtonElement: ElementRef;

  @Input() private options: Options;
  @Input() private routerTree: Array<Route>;

  private ComponentView = ComponentView;
  private Theme = Theme;

  private settingOpened: boolean = false;

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
