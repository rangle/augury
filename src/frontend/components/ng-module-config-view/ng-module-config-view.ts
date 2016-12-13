import {
  Component,
  Input,
} from '@angular/core';

@Component({
  selector: 'ng-module-config-view',
  template: require('./ng-module-config-view.html'),
})
export class NgModuleConfigView {
  @Input() private configKey: string;
  @Input() private config: {[key: string]: Array<string>};

  constructor() {}

}
