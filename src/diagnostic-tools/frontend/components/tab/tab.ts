// third party deps
import { Component } from '@angular/core';
import { select } from '@angular-redux/store';

// same-module deps
import { Selectors } from 'diagnostic-tools/frontend/state.model';
import { DiagActions } from 'diagnostic-tools/frontend/actions';
import { STATEMENT_TYPE } from 'diagnostic-tools/shared/DiagPacket.class';

interface LogEntry {
  txt: string;
}

@Component({
  selector: 'bt-diag-tab',
  template: require('./tab.html'),
  styles: [
    require('to-string!./tab.css'),
    '.assertion-pass { color: green }',
    '.assertion-fail { color: red }',
  ],
})
export class DiagTabComponent {

  @select(Selectors.packets) packets;

  objectKeys = Object.keys; // use in template
  STATEMENT_TYPE = STATEMENT_TYPE; // use in template

  constructor(
    private diagActions: DiagActions,
  ) { }

  /* // @todo: currently not tracking (for *ngFor optimization)
  private trackLogEntry(index: number, entry: LogEntry): string {
    return item.id;
  }
  */
}
