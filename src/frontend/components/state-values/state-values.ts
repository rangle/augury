import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
} from '@angular/core';

import {DomSanitizationService} from '@angular/platform-browser';

import {UserActions} from '../../actions/user-actions/user-actions';
import {Highlightable} from '../highlightable';
import {PropertyEditor} from '../property-editor/property-editor';
import {Path} from '../../../tree';
import ParseData from '../../utils/parse-data';

@Component({
  selector: 'bt-state-values',
  template: require('./state-values.html'),
  directives: [PropertyEditor],
  styles: [require('to-string!./state-values.css')],
})
export default class StateValues extends Highlightable {
  @Input() id: string | number;
  @Input() path: Path;
  @Input() value;
  @Input() level: number;

  private editable: boolean = false;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private userActions: UserActions,
    private domSanitizationService: DomSanitizationService
  ) {
    super(changeDetector);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  private get propertyKey(): string | number {
    return this.path[this.path.length - 1];
  }

  private onValueChanged(newValue) {
    if (newValue !== this.value) {
      this.userActions.updateProperty(this.path, newValue);
    }
  }
}
