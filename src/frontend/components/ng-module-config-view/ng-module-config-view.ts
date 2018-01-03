import {
  Component,
  Input,
} from '@angular/core';

@Component({
  selector: 'ng-module-config-view',
  template: require('./ng-module-config-view.html'),
  styles: [require('to-string!./ng-module-config-view.css')],
})
export class NgModuleConfigView {
  @Input() private config: {[key: string]: Array<string>};
  private keys: Array<string> = ['imports', 'exports', 'providers', 'declarations', 'providersInDeclarations'];

  constructor() {}

}
