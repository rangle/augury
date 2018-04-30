import {
  Component,
  Input,
} from '@angular/core';

@Component({
  selector: 'ng-module-info',
  templateUrl: './ng-module-info.html',
  styleUrls: ['./ng-module-info.css'],
})
export class NgModuleInfo {
  @Input() ngModules: {[key: string]: any};

  constructor() {}
}
