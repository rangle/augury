// third party deps
import { Component, Input } from '@angular/core';
import { select } from '@angular-redux/store';

// same-module deps
import { Selectors } from 'diagnostic-tools/frontend/state.model';
import { DiagActions } from 'diagnostic-tools/frontend/actions';
import { DiagType, DiagPacket, isValidDiagPacket } from 'diagnostic-tools/shared/DiagPacket.class';

@Component({
  selector: 'bt-diag-sidebar',
  template: require('./sidebar.component.html'),
  styles: [
    require('to-string!./sidebar.component.css')
  ],
})
export class DiagSidebarComponent {

  @select(Selectors.presentationOptions) presentationOptions;
  @select(Selectors.packets) packets;

  diagnosticFileToImport: File;
  importError: string;

  constructor(
    private diagActions: DiagActions,
  ) { }

  clearActive = () =>
    this.diagActions.clearActive()

  clearImports = () =>
    this.diagActions.clearImports()

  setShowPassed = (bool: boolean) =>
    this.diagActions.setShowPassed(bool)

  selectFile = (event) =>
    this.diagnosticFileToImport = event.target.files[0];

  importSelectedFile = () =>{
    this.importError = undefined;
    if (!this.diagnosticFileToImport) { return; }
    let fileContent: string;
    let parsedImport: any;
    const reader = new FileReader();
    reader.onload = () => {
      fileContent = reader.result;
      const importIsValid = (parsedImport:any): boolean =>
        Array.isArray(parsedImport)
        && parsedImport.every(isValidDiagPacket);
      try {
        parsedImport = JSON.parse(fileContent)
        if (!importIsValid(parsedImport)) {
          this.importError = 'invalid import.';
        } else {
          this.diagActions.importDiagnostic(<Array<DiagPacket>> parsedImport);
        }
      }
      catch(e) { this.importError = 'invalid import.'; }
    }
    reader.readAsText(this.diagnosticFileToImport)
    this.diagnosticFileToImport = undefined;
  }

  exportDiagnostic(filename = "diag.json") {
    this.packets.first()
      .subscribe(allPackets => {
        const text = JSON.stringify(allPackets)
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      });
  }

}
