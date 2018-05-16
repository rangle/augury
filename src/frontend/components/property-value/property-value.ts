import {
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
} from '@angular/core';

import {Highlightable} from '../../utils/highlightable';

@Component({
  selector: 'bt-property-value',
  templateUrl: './property-value.html',
})
export class PropertyValue extends Highlightable {
  @Input() key: string;
  @Input() value: string;

  constructor(@Inject(ChangeDetectorRef) changeDetectorRef: ChangeDetectorRef) {
    super(changeDetectorRef, changes => changes && changes.hasOwnProperty('value'));
  }
}
