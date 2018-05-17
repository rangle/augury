import { DiagTabComponent } from './tab/tab.component';
import { FunctionDiagnosticComponent } from './function-diagnostic/function-diagnostic.component';
import { EventDiagnosticComponent } from './event-diagnostic/event-diagnostic.component';
import { DiagSidebarComponent } from './sidebar/sidebar.component';
import { DiagTreeNodeComponent } from './diag-tree-node/diag-tree-node.component';
import { GenericTabsComponent } from './generic-tabs/generic-tabs.component';
import { EnableTroubleShootingMessageComponent } from './enable-troubleshooting-message/enable-troubleshooting-message.component';

const DIAG_COMPONENTS = [
  DiagTabComponent,
  FunctionDiagnosticComponent,
  EventDiagnosticComponent,
  DiagSidebarComponent,
  DiagTreeNodeComponent,
  GenericTabsComponent,
  EnableTroubleShootingMessageComponent,
];

export {
  DiagTabComponent,
  DIAG_COMPONENTS
};
