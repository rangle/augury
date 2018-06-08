import { getRandomHash } from './utils.functions'
import { Message, MessageQueue, MessageType, messageSource, Serialize } from './messaging.definitions'

export class MessagePipeBackend {

  // injectables
  private _messageQueue;
  private _sendMessage;
  private _createQueueAlertMessage;

  // internals
  private _handlers: Array<(message: Message<any>) => void> = [];

  constructor(injectables: {
    messageQueue: MessageQueue<Message<any>>,
    sendMessage: (message:Message<any>) => Promise<any>,
    createQueueAlertMessage: () => Message<void>,
  }) {
    this._messageQueue = injectables.messageQueue;
    this._sendMessage = injectables.sendMessage;
    this._createQueueAlertMessage = injectables.createQueueAlertMessage;
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

  public handleIncomingMessage(message: Message<any>) {
    this._handlers.forEach(handler => handler(message))
  }

  public sendSimple(opts: {
    messageType: MessageType,
    content: any,
    serialize?: Serialize,
  }) {
    return this.sendSimpleMessage(
      this.createMessage(opts)
    );
  }

  public sendSimpleMessage(message: Message<any>): Promise<any> {
    return this._sendMessage(message);
  }

  public sendQueued(opts: {
    messageType: MessageType,
    content: any,
    serialize?: Serialize,
  }) {
    return this.sendQueuedMessage(
      this.createMessage(opts)
    );
  }

  public sendQueuedMessage(message: Message<any>): Promise<any> {
    this._messageQueue.enqueue(message);
    return this._sendMessage(this._createQueueAlertMessage());
  }

}
