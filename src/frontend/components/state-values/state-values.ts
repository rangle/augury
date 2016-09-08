import {
  ChangeDetectorRef,
  Component,
  Input,
} from '@angular/core';

import {UserActions} from '../../actions/user-actions/user-actions';
import {Highlightable} from '../../utils/highlightable';
import {Path} from '../../../tree';
import {InputOutput} from '../../utils';

@Component({
  selector: 'bt-state-values',
  template: require('./state-values.html'),
  styles: [require('to-string!./state-values.css')],
})
export class StateValues extends Highlightable {
  @Input() id: string | number;
  @Input() inputs: InputOutput;
  @Input() level: number;
  @Input() path: Path;
  @Input() value;

  private editable: boolean = false;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private userActions: UserActions
  ) {
    super(changeDetector, changes => this.hasChanged(changes));
  }

  private hasChanged(changes) {
    if (changes == null || !changes.hasOwnProperty('value')) {
      return false;
    }

    const oldValue = changes.value.previousValue;
    const newValue = changes.value.currentValue;

    if (oldValue.toString() === 'CD_INIT_VALUE') {
      return false;
    }

    return oldValue !== newValue;
  }

  private get k(): string | number {
    return this.path[this.path.length - 1];
  }

  private onValueChanged(newValue) {
    if (newValue !== this.value) {
      this.userActions.updateProperty(this.path, newValue);
    }
  }
}
