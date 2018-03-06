// third party deps
import { Component } from '@angular/core';
import { select } from '@angular-redux/store';

// same-module deps
import { Selectors } from 'diagnostic-tools/frontend/state.model';
import { DiagService } from 'diagnostic-tools/frontend/service';

@Component({
  selector: 'bt-diag-sidebar',
  template: require('./sidebar.component.html'),
  styles: [
    require('to-string!./sidebar.component.css')
  ],
})
export class DiagSidebarComponent {

  @select(Selectors.presentationOptions) presentationOptions;

  constructor(
    private diagService: DiagService,
  ) { }

  setShowPassed = (bool: boolean) =>
    this.diagService.setShowPassed(bool)

}
