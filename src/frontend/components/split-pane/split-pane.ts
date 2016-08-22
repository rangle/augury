/**
 * <split-pane> component.
 *
 * This may seem like a mess, but there is no other way to implement resizable panes.
 */

import {
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';

// This value matches the behaviour in the Chrome Dev Tools
const MIN_PANE_WIDTH = 26;

const DEFAULT_SECONDARY_WIDTH = 384;

@Component({
  selector: 'split-pane',
  templateUrl: '/src/frontend/components/split-pane/split-pane.html'
})
export default class SplitPane {
  @ViewChild('wrapper') wrapperElement : ElementRef;
  @ViewChild('resizer') resizerElement : ElementRef;
  @ViewChild('movecapture') moveCaptureElement : ElementRef;
  @ViewChild('primary') primaryElement : ElementRef;
  @ViewChild('secondary') secondaryElement : ElementRef;

  // TODO: store the initial secondary pane width in a preference.
  secondaryWidth = DEFAULT_SECONDARY_WIDTH;

  // State for resizing
  mouseX : number;
  bounds : ClientRect;

  /**
   * When the component initializes, capture the initial geometry,
   * and set up the resizer element.
   */
  ngAfterViewInit() {
    this.bounds = this.wrapperElement.nativeElement.getBoundingClientRect();

    this.reshape();
  }

  /**
   * Capture the starting mouse position, and set up
   * the mouse move capture div for a resize drag.
   */
  resizerMouseDown ($event) {
    this.moveCaptureElement.nativeElement.style.display = 'block';
    this.secondaryWidth = this.clampSecondaryWidth();

    this.mouseX = $event.clientX;
  }

  /**
   * Handle mouse move events on the mouse move capture div.
   */
  moveCaptureMouseMove ($event) {
    this.secondaryWidth = (this.mouseX - $event.clientX) + this.secondaryWidth;
    this.mouseX = $event.clientX;

    this.reshape();
  }

  /**
   * Clamp the secondary panel width value to prevent layout issues.
   */
  clampSecondaryWidth () {
    const minSecondaryWidth = this.secondaryWidth < MIN_PANE_WIDTH ?
      MIN_PANE_WIDTH :
      this.secondaryWidth;
    const clampedSecondaryWidth = this.bounds.width - minSecondaryWidth < MIN_PANE_WIDTH ?
      this.bounds.width - MIN_PANE_WIDTH :
      minSecondaryWidth;
    return clampedSecondaryWidth;
  }

  /**
   * Finalize a resize drag, and set secondaryWidth
   * to reflect what is currently rendered.
   */
  moveCaptureMouseUp () {
    this.moveCaptureElement.nativeElement.style.display = 'none';

    this.secondaryWidth = this.clampSecondaryWidth();
  }

  /**
   * Reshape the resizer, primary pane, and secondary pane
   * based on current component geometry and panel width.
   */
  reshape() {
    const clampedSecondaryWidth = this.clampSecondaryWidth();

    // Set the primary pane width.
    this.primaryElement.nativeElement.style.width = (this.bounds.width - clampedSecondaryWidth) + 'px';
    this.primaryElement.nativeElement.style.minWidth = (this.bounds.width - clampedSecondaryWidth) + 'px';

    // Set the secondary pane width.
    this.secondaryElement.nativeElement.style.width = clampedSecondaryWidth + 'px';
    this.secondaryElement.nativeElement.style.minWidth = clampedSecondaryWidth + 'px';

    // Place the resizer bar where it is expected.
    this.resizerElement.nativeElement.style.right = clampedSecondaryWidth + 'px';
    this.resizerElement.nativeElement.style.height = this.bounds.height + 'px';
    this.resizerElement.nativeElement.style.top = this.bounds.top + 'px';
  }

  /**
   * No event is fired when an individual element's size changes, so
   * the best we can do for now is reshape when window is resized.
   */
  windowResized () {
    this.bounds = this.wrapperElement.nativeElement.getBoundingClientRect();

    this.reshape();
  }
}
