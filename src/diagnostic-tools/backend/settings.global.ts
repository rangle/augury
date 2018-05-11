import {SimpleOptions} from 'diagnostic-tools/module-dependencies.barrel';

let _enabled: boolean = false;

export const isEnabled = (): boolean => _enabled;
export const enableDiagnosticBackend = () => _enabled = true;
export const disableDiagnosticBackend = () => _enabled = false;

export const receiveOptions = (opts: SimpleOptions) => {
  if (opts.diagnosticToolsEnabled) { enableDiagnosticBackend(); }
  else { disableDiagnosticBackend(); }
}
