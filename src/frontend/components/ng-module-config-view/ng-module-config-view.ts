import {
  Component,
  Input,
} from '@angular/core';

@Component({
  selector: 'ng-module-config-view',
  templateUrl: './ng-module-config-view.html',
  styleUrls: ['./ng-module-config-view.css'],
})
export class NgModuleConfigView {
  @Input() private config: {[key: string]: Array<string>};
  keys: Array<string> = ['imports', 'exports', 'providers', 'declarations', 'providersInDeclarations'];

  constructor() {}
}
