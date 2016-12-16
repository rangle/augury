import {
  Component,
  Input,
} from '@angular/core';

@Component({
  selector: 'ng-module-info',
  template: require('./ng-module-info.html'),
  styles: [require('to-string!./ng-module-info.css')],
})
export class NgModuleInfo {
  @Input() private ngModules: {[key: string]: any};

  constructor() {}

}
