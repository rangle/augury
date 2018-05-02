// third party deps
import { Component, Input } from '@angular/core';

// same-module deps
import { Selectors } from 'diagnostic-tools/frontend/state.model';
import { DiagActions } from 'diagnostic-tools/frontend/actions';
import { FunctionDiagnostic, STATEMENT_TYPE } from 'diagnostic-tools/shared/FunctionDiagnostic.class';

@Component({
  selector: 'bt-function-diagnostic-old',
  template: require('./function-diagnostic.component.html'),
  styles: [
    require('to-string!./function-diagnostic.component.css'),
  ],
})
export class FunctionDiagnosticComponent {

  @Input('fd') fd: FunctionDiagnostic;

  objectKeys = Object.keys; // use in template
  STATEMENT_TYPE = STATEMENT_TYPE; // use in template

  constructor() { }

}
