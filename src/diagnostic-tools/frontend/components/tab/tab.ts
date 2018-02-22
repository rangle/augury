import { Component } from '@angular/core';
import { select } from '@angular-redux/store';

import { selectors } from '../../state.model'; // @todo: fix path, get rid of ../..
import { DiagActions } from '../../actions'; // @todo: fix path, get rid of ../..

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
