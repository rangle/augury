import {
  ChangeDetectorRef,
  SimpleChanges
} from '@angular/core';

import { highlightTime } from '../../utils/configuration';

export class Highlightable {
  private isUpdated = false;

  private resetUpdateState;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private getUpdated?: (changes: SimpleChanges) => boolean
  ) {}

  protected ngOnChanges(changes: SimpleChanges) {
    if (typeof this.getUpdated === 'function') {
      if (!this.getUpdated(changes)) {
        return;
      }
    }
    else {
      if (changes.hasOwnProperty('id')
      || !changes.hasOwnProperty('value')) {
        return;
      }
    }

    this.isUpdated = true;

    clearTimeout(this.resetUpdateState);

    this.resetUpdateState = setTimeout(() => {
        this.resetUpdateState = null;

        this.isUpdated = false;

        if (this.changeDetectorRef) {
          this.changeDetectorRef.detectChanges();
        }
      },
      highlightTime);
  }

  protected ngOnDestroy() {
    clearTimeout(this.resetUpdateState);
  }
}
