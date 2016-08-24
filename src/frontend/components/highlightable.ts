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
    private getUpdated?: (changes?: SimpleChanges) => boolean
  ) {}

  protected ngOnChanges(changes: SimpleChanges) {
    if (typeof this.getUpdated === 'function') {
      if (this.getUpdated(changes)) {
        this.changed();
      }
    }
    else {
      this.changed();
    }
  }

  protected ngOnDestroy() {
    this.isUpdated = false;

    clearTimeout(this.resetUpdateState);
  }

  protected changed() {
    if (this.isUpdated) {
      return;
    }

    this.isUpdated = true;

    this.resetUpdateState = setTimeout(() => {
        this.resetUpdateState = null;

        this.isUpdated = false;

        if (this.changeDetectorRef) {
          this.changeDetectorRef.detectChanges();
        }
      },
      highlightTime);

    this.changeDetectorRef.detectChanges();
  }
}
