import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { filterApiList } from '../../utils/api-blacklist';

@Component({
  selector: 'ng-module-info',
  templateUrl: './ng-module-info.html',
  styleUrls: ['./ng-module-info.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgModuleInfo {
  @Input() ngModules: { [key: string]: any };

  hideAngularModules: boolean = true;

  constructor() {}

  private moduleList = (hideAngularModules: boolean): Array<string> => {
    return hideAngularModules ? filterApiList(this.ngModules.names, true) : this.ngModules.names;
  };
}
