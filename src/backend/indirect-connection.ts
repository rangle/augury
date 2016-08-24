import {
  Message,
  MessageFactory,
  browserDispatch,
  browserSubscribeResponse,
} from '../communication';

export const send = <Response, T>(message: Message<T>): Promise<Response> => {
  return new Promise((resolve, reject) => {
    browserSubscribeResponse(message.messageId, response => resolve(response));
    browserDispatch(MessageFactory.dispatchWrapper(message));
  });
};

