import {
  ChangeDetectorRef,
  SimpleChanges
} from '@angular/core';

import {highlightTime} from '../../utils/configuration';

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
        return;
      }
    }
    else {
      this.changed();
      return;
    }

    this.clear();
  }

  protected ngOnDestroy() {
    this.isUpdated = false;

    clearTimeout(this.resetUpdateState);
  }

  private clear() {
    this.resetUpdateState = null;

    this.isUpdated = false;

    this.changeDetectorRef.detectChanges();
  }

  protected changed() {
    this.isUpdated = true;

    this.resetUpdateState = setTimeout(() => this.clear(), highlightTime);

    this.changeDetectorRef.detectChanges();
  }
}
