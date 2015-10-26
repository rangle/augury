declare var JSONFormatter: any;
import {Component, View, NgIf, LifeCycle, ElementRef, Inject}
  from 'angular2/angular2';
import {ComponentDataStore}
  from '../../stores/component-data/component-data-store';
import {UserActions} from '../../actions/user-actions/user-actions';

@Component({
  selector: 'bt-info-panel'
})
@View({
  templateUrl: 'components/info-panel/info-panel.html',
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
      .subscribe(({ selectedNode }) => {
        this.node = selectedNode;
        const container = this.elementRef.nativeElement.lastChild;

        if (container && selectedNode) {
          const formatter = new JSONFormatter(selectedNode);

          while (container.firstChild) {
            container.removeChild(container.firstChild);
          }

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
