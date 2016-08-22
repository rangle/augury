import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
} from '@angular/core';

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

  private editable: boolean = false;

  constructor(
    @Inject(ChangeDetectorRef) private changeDetector: ChangeDetectorRef,
    @Inject(UserActions) private userActions: UserActions
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
