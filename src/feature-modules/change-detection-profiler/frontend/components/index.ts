import { ComponentChangeDetectionBoxComponent } from './component-cd-box/component-cd-box.component';
import { GlobalChangeDetectionSidebarComponent } from './global-cd-sidebar/global-cd-sidebar.component';
import { POCComponent } from './augury2-poc/poc.component';

export { GlobalChangeDetectionSidebarComponent };
export { ComponentChangeDetectionBoxComponent };
export { POCComponent };

export const CHANGE_DETECTION_PROFILER_COMPONENTS = [
  GlobalChangeDetectionSidebarComponent,
  ComponentChangeDetectionBoxComponent,
  POCComponent,
];
