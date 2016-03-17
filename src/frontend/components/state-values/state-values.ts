import {Component, EventEmitter, Input} from 'angular2/core';
import {UserActions} from '../../actions/user-actions/user-actions';
import ParseData from '../../utils/parse-data';

@Component({
  selector: 'bt-state-values',
  templateUrl:
  '/src/frontend/components/state-values/state-values.html'
})
export default class StateValues {

  @Input() id: any;
  @Input() value: any;
  @Input() propertyTree: string;

  private editable: boolean = false;

  constructor(
    private userActions: UserActions
  ) { }

  getPropertyKey(tree: any): string {
    tree = tree.split(',');
    return tree[tree.length - 1] || '';
  }

  onDblClick($event) {
    this.editable = true;
    $event.preventDefault();
    $event.stopPropagation();
  }

  propertyChange($event, value) {
    if ($event.keyCode === 13) {
      this.editable = false;

      const type: string = ParseData.getTypeByValue(this.value);

      let newValue: any;
      if (type === 'number') {
        newValue = ParseData.convertToNumber(value, this.value);
      } else if (type === 'boolean') {
        newValue = ParseData.convertToBoolean(value, this.value);
      } else {
        newValue = value;
      }

      if (newValue !== this.value) {

        const property = {
          'propertyTree': this.propertyTree.substr(1),
          'value': newValue,
          'id': this.id,
          'type': type
        };
        this.userActions.updateProperty({property});
      }
    }
  }
}
