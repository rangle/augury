import { Injectable } from '@angular/core';

import { getRandomHash } from './utils.functions'
import { Message, MessageQueue, MessageType, messageSource, Connection, DirectConnection, Serialize } from './messaging.definitions'

@Injectable()
export class MessagePipeFrontend {

  // internals
  private _handlers: Array<(message: Message<any>) => void> = [];

  constructor(
    private _connection: Connection,
    private _directConnection: DirectConnection
  ) {
    this._connection.subscribe(
      (message: Message<any>) => this._handlers.forEach(handler => handler(message)));
  }

  public createMessage<T>(opts: {
    messageType: MessageType,
    content: T,
    serialize?: Serialize,
  }): Message<T> {
    return Object.assign({
      messageSource,
      messageId: getRandomHash(),
      serialize: Serialize.None,
    }, opts)
  }

  public addHandler(handler: (message: Message<any>) => void) {
    this._handlers.push(handler)
  }

  public send(opts: {
    messageType: MessageType,
    content: any,
    serialize?: Serialize,
  }): Promise<any> {
    return this.sendMessage(
      this.createMessage(opts)
    );
  }

  public handleImmediate(opts: {
    messageType: MessageType,
    content: any,
    serialize?: Serialize,
  }): Promise<any> {
    return this.handleImmediateMessage(
      this.createMessage(opts)
    );
  }

  public sendMessage(message: Message<any>): Promise<any> {
    return this._connection.send(message);
  }

  public handleImmediateMessage(message: Message<any>): Promise<any> {
    return this._directConnection.handleImmediate(message);
  }

}
