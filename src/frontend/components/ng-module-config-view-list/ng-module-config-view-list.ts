import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'ng-module-config-view-list',
  templateUrl: './ng-module-config-view-list.html',
  // note that CDS is implicit since ng-module-config-view.ts is a parent component,
  // this is explicitly set here for readability purposes
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgModuleConfigViewList {
  @Input() configList: Array<string>;
}
