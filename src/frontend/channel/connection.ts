import {Injectable} from '@angular/core';

import {
  Message,
  sendToExtension,
} from '../../channel';

@Injectable()
export class Connection {
  send<Response, T>(message: Message<T>): Promise<Response> {
    return sendToExtension<Response>(message);
  }
}