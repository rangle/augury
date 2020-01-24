import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { filterApiList } from '../../utils/api-blacklist';

@Component({
  selector: 'ng-module-config-view',
  templateUrl: './ng-module-config-view.html',
  styleUrls: ['./ng-module-config-view.css'],
  // note that CDS is implicit since ng-module-info.ts is a parent component,
  // this is explicitly set here for readability purposes
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgModuleConfigView {
  @Input() private config: { [key: string]: Array<string> };
  @Input() public moduleName: string;

  keys: Array<string> = ['imports', 'exports', 'providers', 'declarations', 'providersInDeclarations'];

  hideAngularApis: boolean = true;

  constructor() {}

  private keysList = (hideAngularApis: boolean, listToFilter: Array<string>): Array<string> => {
    return hideAngularApis ? filterApiList(listToFilter) : listToFilter;
  };
}
