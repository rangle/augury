// third party deps
import { Component } from '@angular/core';
import { select } from '@angular-redux/store';

// same-module deps
import { selectors } from 'diagnostic-tools/frontend/state.model';
import { DiagActions } from 'diagnostic-tools/frontend/actions';

interface LogEntry {
  txt: string;
}

@Component({
  selector: 'bt-diag-tab',
  template: require('./tab.html'),
  styles: [require('to-string!./tab.css')],
})
export class DiagTabComponent {

  @select(selectors.log) log;

  objectKeys = Object.keys; // use in template

  constructor(
    private diagActions: DiagActions,
  ) { }

  /* // @todo: currently not tracking
  private trackLogEntry(index: number, entry: LogEntry): string {
    return item.id;
  }
  */
}
