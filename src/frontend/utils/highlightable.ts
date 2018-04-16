import {
  ChangeDetectorRef,
  SimpleChanges,
  NgZone,
} from '@angular/core';

import {highlightTime} from '../../utils/configuration';

const initialTimespan = highlightTime;

export abstract class Highlightable {
  isUpdated = false;

  private timespan = initialTimespan; // scales down

  private resetUpdateState;

  constructor(
    private elementChangeDetector: ChangeDetectorRef,
    private elementIsUpdated?: (changes?: SimpleChanges) => boolean
  ) {}

  protected ngOnChanges(changes: SimpleChanges) {
    if (typeof this.elementIsUpdated === 'function') {
      if (this.elementIsUpdated(changes)) {
        this.changed();
      }
    }
    else {
      this.changed();
    }
  }

  protected ngOnDestroy() {
    this.elementChangeDetector = null;

    this.clear();
  }

  protected clear() {
    clearTimeout(this.resetUpdateState);

    this.resetUpdateState = null;

    this.isUpdated = false;

    if (this.elementChangeDetector) {
      this.elementChangeDetector.detectChanges();
    }
  }

  protected changed() {
    this.isUpdated = true;

    if (this.resetUpdateState != null) {
      clearTimeout(this.resetUpdateState);

      this.timespan = initialTimespan * 0.1;
    }
    else {
      this.timespan = initialTimespan;
    }

    this.resetUpdateState = setTimeout(() => this.clear(), highlightTime);

    if (this.elementChangeDetector) {
      this.elementChangeDetector.detectChanges();
    }
  }
}
