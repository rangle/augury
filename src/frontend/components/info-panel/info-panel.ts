declare var JSONFormatter: any;
import {Component, View, ElementRef, Inject} from 'angular2/core';
import {NgIf} from 'angular2/common';
import * as Rx from 'rxjs';
import {ComponentDataStore}
  from '../../stores/component-data/component-data-store';
import {UserActions} from '../../actions/user-actions/user-actions';

@Component({
  selector: 'bt-info-panel'
})
@View({
  templateUrl: '/src/frontend/components/info-panel/info-panel.html',
  directives: [NgIf]
})
/**
 * Info Panel
 * Displays state, inputs & outputs
 */
export class InfoPanel {

  private node: any;
  constructor(
    private componentDataStore: ComponentDataStore,
    @Inject(ElementRef) private elementRef: ElementRef
  ) {

    // Listen for changes to selected node
    this.componentDataStore.dataStream
      .debounce((x) => {
        return Rx.Observable.timer(100);
      })
      .subscribe(({ selectedNode }) => {
        this.node = selectedNode;
        const container = this.elementRef.nativeElement.lastChild;

        if (container) {
          while (container.firstChild) {
            container.removeChild(container.firstChild);
          }

          if (!selectedNode) {
            selectedNode = {};
          }
          const formatter = new JSONFormatter(selectedNode);
          container.appendChild(formatter.render());
        }

      });

  }

  /**
   * Return a prettified object
   * to be rendered in the template
   * @param  {Objecy} object
   */
  prettify(object) {
    return JSON.stringify(object, null, 1);
  }

}
