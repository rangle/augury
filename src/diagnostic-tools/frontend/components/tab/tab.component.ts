import { Observable, AnonymousSubject } from 'rxjs';

// third party deps
import { Component } from '@angular/core';
import { select } from '@angular-redux/store';

// same-module deps
import { Selectors, Import, ACTIVE_TAB, PacketTreeNode } from 'diagnostic-tools/frontend/state.model';
import { DiagActions } from 'diagnostic-tools/frontend/actions';
import { DiagType } from 'diagnostic-tools/shared/DiagPacket.class';

const ACTIVE_TAB_FORMATTED = 'Active';

@Component({
  selector: 'bt-diag-tab',
  templateUrl: './tab.component.html',
  styleUrls: [
    './tab.component.css'
  ],
})
export class DiagTabComponent {

  DiagType = DiagType; // used in template

  @select(Selectors.packets) packets;
  @select(Selectors.packetTree) packetTree;
  @select(Selectors.presentationOptions) presentationOptions;
  @select(Selectors.imports) imports;
  @select(Selectors.currentView) currentView;

  constructor(
    private diagActions: DiagActions,
  ) { }

  shouldShowTabs(imports: Array<Import>): boolean {
    return !!imports.length
  }

  getActiveTab(name: string): string {
    return name === ACTIVE_TAB ? ACTIVE_TAB_FORMATTED : name;
  }

  getTabs(imports: Array<Import>): Array<string> {
    return [ ACTIVE_TAB_FORMATTED ]
      .concat((imports || []).map(i => i.name));
  }

  selectTab(name: string) {
    this.diagActions.setCurrentView(
      name === ACTIVE_TAB_FORMATTED ? ACTIVE_TAB : name
    );
  }

  getTreeInView(imports: Array<Import>, localTree: PacketTreeNode, name: string) {
    const importInView = imports.find(i => i.name === name);
    return importInView ? importInView.packetTree : localTree;
  }

  /* // @todo: currently not tracking (for *ngFor optimization)
  private trackLogEntry(index: number, entry: LogEntry): string {
    return item.id;
  }
  */
}
