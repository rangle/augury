// third party deps
import { Component, Input } from '@angular/core';

// same-module deps
import { Selectors } from 'diagnostic-tools/frontend/state.model';
import { DiagActions } from 'diagnostic-tools/frontend/actions';
import { EventDiagnostic, STATEMENT_TYPE } from 'diagnostic-tools/shared';

@Component({
  selector: 'bt-event-diagnostic',
  templateUrl: './event-diagnostic.component.html',
  styleUrls: [
    './event-diagnostic.component.css',
  ],
})
export class EventDiagnosticComponent {

  @Input('ed') fd: EventDiagnostic;
  @Input('full') full: boolean;

  objectKeys = Object.keys; // use in template
  STATEMENT_TYPE = STATEMENT_TYPE; // use in template

  constructor() { }

}
