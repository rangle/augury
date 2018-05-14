//same-module deps
import { takeOptions } from './settings.global';
import { Message, MessageType } from '../module-dependencies.barrel'

export const backendDiagnosticsMessageHandler = (message: Message<any>) => {
  switch (message.messageType) {
    case MessageType.DiagnosticOptionsUpdated:
      takeOptions(message.content)
      return true;
  }
}
