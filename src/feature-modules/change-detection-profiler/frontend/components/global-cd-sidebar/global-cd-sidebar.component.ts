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
  selector: 'bt-global-cd-sidebar',
  templateUrl: './global-cd-sidebar.component.html',
  styleUrls: ['./global-cd-sidebar.component.css'],
  host: { 'class': 'flex overflow-auto' },
})
export class GlobalChangeDetectionSidebarComponent {

  @select(Selectors.ticks) ticks;
  @select(Selectors.cyclesPerSecond) cycles_per_second;

  constructor(
    private _nodeStateService: ChangeDetectionProfilerService
  ) {
    this.ticks.subscribe((...args) => console.log(args))
  }

}
