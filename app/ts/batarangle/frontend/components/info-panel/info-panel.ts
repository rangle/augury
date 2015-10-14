import {Component, View, NgIf, LifeCycle}
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
    private componentDataStore: ComponentDataStore
  ) {

    // Listen for changes to selected node
    this.componentDataStore.dataStream
      .subscribe(({ selectedNode }) => {
        this.node = selectedNode;
      });

  }

  /**
   * Return a prettified object
   * to be rendered in the template
   * @param  {Objecy} object
   */
  prettify(object) {

    return JSON.stringify(object, null, 2);

  }

}
