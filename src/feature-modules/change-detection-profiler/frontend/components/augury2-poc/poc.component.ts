import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { select } from '@angular-redux/store';

import { ChangeDetectionProfilerService } from '../../service';
import { ChangeDetectionProfilerSelectors as Selectors } from '../../state.model';

@Component({
  selector: 'bt-poc',
  templateUrl: './poc.component.html',
  host: { 'class': 'flex overflow-auto' },
})
export class POCComponent {

  @select(Selectors.ticks) ticks;
  @select(Selectors.cyclesPerSecond) cycles_per_second;

  constructor(
    private _nodeStateService: ChangeDetectionProfilerService
  ) {
    this.ticks.subscribe((...args) => console.log(args))
  }

}
