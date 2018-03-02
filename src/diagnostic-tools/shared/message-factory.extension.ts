// project deps
import { create, Message } from 'diagnostic-tools/module-dependencies.barrel';
import { MessageFactory } from 'diagnostic-tools/module-dependencies.barrel';
import { MessageType } from 'diagnostic-tools/module-dependencies.barrel';

// same-module deps
import { DiagPacket } from 'diagnostic-tools/shared/DiagPacket.class';

export class DiagnosticMessageFactory extends MessageFactory {

  static diagnosticPacket(packet: DiagPacket): Message<DiagPacket> {
    return create({
      messageType: MessageType.DiagnosticPacket,
      content: packet
    });
  }

  static diagnosticMsg(msg: { txt }): Message<{ txt: string }> {
    return create({
      messageType: MessageType.DiagnosticMsg,
      content: msg
    });
  }

}
