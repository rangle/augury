import { ComponentChangeDetectionBoxComponent } from './component-cd-box/component-cd-box.component';
import { GlobalChangeDetectionSidebarComponent } from './global-cd-sidebar/global-cd-sidebar.component';

export { GlobalChangeDetectionSidebarComponent };
export { ComponentChangeDetectionBoxComponent };

export const CHANGE_DETECTION_PROFILER_COMPONENTS = [
  GlobalChangeDetectionSidebarComponent,
  ComponentChangeDetectionBoxComponent
];
