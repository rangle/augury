import {
  ChangeDetectorRef,
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

import {UserActions} from '../../actions/user-actions/user-actions';
import {Highlightable} from '../../utils/highlightable';
import {functionName} from '../../../utils';
import {propertyIndex} from '../../../backend/utils';
import {
  Path,
  ObjectType,
  Metadata,
} from '../../../tree';

@Component({
  selector: 'bt-state-values',
  template: require('./state-values.html'),
  styles: [require('to-string!./state-values.css')],
})
export class StateValues extends Highlightable {
  @Input() path: Path;
  @Input() metadata: ObjectType;
  @Input() value;
  @Input() showDeleteMe: boolean;

  @Output() updateValue = new EventEmitter<{path: Path, propertyKey: Path, newValue}>();

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

    if (oldValue && oldValue.toString() === 'CD_INIT_VALUE') {
      return false;
    }

    if (typeof oldValue === 'function' && typeof newValue === 'function') {
      return functionName(oldValue) !== functionName(newValue);
    }

    return oldValue !== newValue;
  }

  private get key(): string | number {
    return this.path[this.path.length - 1];
  }

  private onDeleteMe(){
    const index = propertyIndex(this.path);
    const path = this.path.slice(0, index);
    const propertyKey = this.path.slice(index);
    this.updateValue.emit({path, propertyKey, newValue: undefined});
  }

  private onValueChanged(newValue) {
    if (newValue !== this.value) {
      const index = propertyIndex(this.path);

      const path = this.path.slice(0, index);

      const propertyKey = this.path.slice(index);

      this.updateValue.emit({path, propertyKey, newValue});
    }
  }
}
