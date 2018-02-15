import { Component } from '@angular/core';

interface LogEntry {
  txt: string;
}

@Component({
  selector: 'bt-diagnostic-tools',
  template: require('./diagnostic-tools.html'),
  styles: [require('to-string!./diagnostic-tools.css')],
})
export class DiagnosticTools {

  private log: Array<LogEntry> = [{ txt: 'erer' }, { txt: 'llll' }];

  /* // currently not tracking
  private trackLogEntry(index: number, entry: LogEntry): string {
    return item.id;
  }
  */
}
