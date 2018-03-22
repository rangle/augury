
let _enabled: boolean = false;

export const isEnabled = (): boolean => _enabled
export const enableDiagnosticBackend = () => _enabled = true
