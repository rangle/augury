import {
  Message,
  MessageFactory,
  messageJumpContext,
  browserSubscribeResponse,
} from '../communication';

export const send = <Response, T>(message: Message<T>): Promise<Response> => {
  return new Promise((resolve, reject) => {
    browserSubscribeResponse(message.messageId, response => resolve(response));
    messageJumpContext(MessageFactory.dispatchWrapper(message));
  });
};

