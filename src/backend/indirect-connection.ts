import {
  Message,
  MessageFactory,
  messageJumpContext,
  DispatchHandler,
  browserSubscribeResponse,
} from '../communication';

export const send = <Response, T>(message: Message<T>): Promise<Response> => {
  return new Promise((resolve, reject) => {
    browserSubscribeResponse(message.messageId, <DispatchHandler>(response => resolve(<any>response)));
    messageJumpContext(MessageFactory.dispatchWrapper(message));
  });
};
