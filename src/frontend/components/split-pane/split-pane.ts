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
  templateUrl: './split-pane.html'
})
export class SplitPane {
  @ViewChild('wrapper') wrapperElement : ElementRef;
  @ViewChild('resizer') resizerElement : ElementRef;
  @ViewChild('overlay') overlayElement : ElementRef;
  @ViewChild('primary') primaryElement : ElementRef;
  @ViewChild('secondary') secondaryElement : ElementRef;

  // TODO: store the initial secondary pane width in a preference.
  secondaryWidth = DEFAULT_SECONDARY_WIDTH;

  // State for resizing
  mouseX : number;
  bounds : ClientRect;
  guardMouseMoved;
  guardMouseUp;

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
   * When the component initializes, capture the initial geometry,
   * and set up the resizer element.
   */
  ngAfterViewInit() {
    // Proxy event handlers to preserve instance binding.
    this.guardMouseMoved = (e) => this.mouseMoved(e);
    this.guardMouseUp = (e) => this.mouseUp(e);

    this.windowResized();
  }

  /**
   * Automatically resize window panes after tab change
   */
  handleTabNavigation () {
    setTimeout(this.windowResized.bind(this));
  }

  /**
   * Capture the starting mouse position, and set up
   * the mouse move capture div for a resize drag.
   */
  resizerMouseDown ($event) {
    this.secondaryWidth = this.clampSecondaryWidth();

    this.mouseX = $event.clientX;

    // Required to convince TypeScript that there is a WebkitUserSelect CSS property.
    const bodyStyle : any = window.document.body.style;
    bodyStyle.WebkitUserSelect = 'none';

    this.overlayElement.nativeElement.style.display = 'block';

    window.addEventListener('mousemove', this.guardMouseMoved);
    window.addEventListener('mouseup', this.guardMouseUp);
  }

  /**
   * Handle mouse move events on window.
   */
  mouseMoved (e) {
    this.secondaryWidth = (this.mouseX - e.clientX) + this.secondaryWidth;
    this.mouseX = e.clientX;

    this.reshape();
  }

  /**
   * Finalize a resize drag, and set secondaryWidth
   * to reflect what is currently rendered.
   */
  mouseUp (e) {
    // Required to convince TypeScript that there is a WebkitUserSelect CSS property.
    const bodyStyle : any = window.document.body.style;
    bodyStyle.WebkitUserSelect = '';

    this.overlayElement.nativeElement.style.display = 'none';

    window.removeEventListener('mousemove', this.guardMouseMoved);
    window.removeEventListener('mouseup', this.guardMouseUp);

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
