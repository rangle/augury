import {
  Component,
  Input,
  ElementRef
} from '@angular/core';

declare const JSONFormatter: any;

@Component({
  selector: 'bt-render-object',
  template: require('./render-object.html'),
  styles: [require('to-string!style!./render-object.css')],
})
export class RenderObject {
  @Input() private object: any;
  private previousObject: any;

  constructor(private elementRef: ElementRef) {
  }

  ngAfterViewChecked() {
    const el = this.elementRef.nativeElement;
    if (this.previousObject === this.object) {
      return;
    }

    this.previousObject = this.object;

    if (el.hasChildNodes()) {
      while (el.hasChildNodes()) {
        el.removeChild(el.lastChild);
      }
    }

    return this.render(el);
  }

  render(el) {
    if (Array.isArray(this.object)) {
      return this.object
        .map(RenderObject.generateOutput)
        .forEach((c) => el.appendChild(c));
    }
    return el.appendChild(
      RenderObject.generateOutput(this.object)
    );
  }

  static generateOutput(obj: Object): any {
    let formatter = new JSONFormatter(obj, 0, {
      hoverPreviewEnabled: false,
      hoverPreviewArrayCount: 0,
      hoverPreviewFieldCount: 0
    });
    return formatter.render();
  }
}
