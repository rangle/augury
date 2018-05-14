// third party deps
import { Component, Output, EventEmitter } from '@angular/core';

// same-module deps
import { Selectors } from 'diagnostic-tools/frontend/state.model';
import { DiagService } from 'diagnostic-tools/frontend/service';

@Component({
  selector: 'bt-enable-troubleshooting-message',
  templateUrl: './enable-troubleshooting-message.component.html',
  styleUrls: [
    './enable-troubleshooting-message.component.css',
  ],
})
export class EnableTroubleShootingMessageComponent {

  @Output('onToggle') onToggle = new EventEmitter<boolean>();

  constructor(
    public diagService: DiagService
  ) { }

  private toggle = (value: boolean) => {
    if (value) {
      this.diagService.enable();
      this.onToggle.emit(true);
    } else {
      this.onToggle.emit(false);
      this.diagService.disable();
    }
  }

}
