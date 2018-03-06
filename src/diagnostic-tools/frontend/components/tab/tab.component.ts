// third party deps
import { Component } from '@angular/core';
import { select } from '@angular-redux/store';

// same-module deps
import { Selectors } from 'diagnostic-tools/frontend/state.model';
import { DiagActions } from 'diagnostic-tools/frontend/actions';
import { DiagType } from 'diagnostic-tools/shared/DiagPacket.class';

@Component({
  selector: 'bt-diag-tab',
  template: require('./tab.component.html'),
  styles: [
    require('to-string!./tab.component.css')
  ],
})
export class DiagTabComponent {

  @select(Selectors.packets) packets;
  @select(Selectors.presentationOptions) presentationOptions;

  DiagType = DiagType; // used in template

  constructor(
    private diagActions: DiagActions,
  ) { debugger; }

  /* // @todo: currently not tracking (for *ngFor optimization)
  private trackLogEntry(index: number, entry: LogEntry): string {
    return item.id;
  }
  */
}
