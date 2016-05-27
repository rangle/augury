import {Component, EventEmitter, Input, OnChanges, NgZone}
  from '@angular/core';

@Component({
  selector: 'bt-property-value',
  templateUrl:
  '/src/frontend/components/property-value/property-value.html'
})
export default class PropertyValue implements OnChanges {

  @Input() key: string;
  @Input() value: string;
  @Input() checkUpdate: boolean = false;

  private isUpdated: boolean = false;

  constructor(
    private _ngZone: NgZone
  ) { }

  ngOnChanges(changes: any) {
    if (this.checkUpdate && changes &&
      changes.value !== undefined &&
      changes.value.currentValue !== changes.value.previousValue) {
      this.isUpdated = true;
      setTimeout(() => {
        this.isUpdated = false;
        this._ngZone.run(() => undefined);
      }, 1750);
    }
  }

}
