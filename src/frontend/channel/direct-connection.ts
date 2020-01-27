import { Injectable } from '@angular/core';

import { Message, MessageResponse } from '../../communication';

import { deserialize } from '../../utils';

/// For large messages, we use a strategy of pulling the data directly from the
/// backend code using inspectedWindow instead of sending the data through the
/// multiple ports that messages are typically sent through. This is a performance
/// optimization. To send a normal message from the backend, to the content script,
/// to the background channel, and finally to the frontend, requires four
/// serialize / deserialize operations to happen in sequence and introduces a large
/// amount of latency into the application.
@Injectable()
export class DirectConnection {
  handleImmediate<T>(message: Message<T>): Promise<any> {
    return this.remoteExecute(`inspectedApplication.handleImmediate(${JSON.stringify(message)})`)
      .then(response => deserialize(response))
      .catch(e => console.error(e));
  }

  readQueue(processor: (message: Message<any>, respond: (response: MessageResponse<any>) => void) => void) {
    /// We are being told that there are messages waiting for us in the backend
    /// message buffer. For large amounts of data, we do not send them through
    /// the normal pipe because it involves four separate serialize + deserialize
    /// operations and causes dramatic latency. Instead, when a large amount of
    /// data is being sent from the backend, it just adds it to a message queue
    /// and sends us a small {@link MessageType.Push} message to indicate that the
    /// buffer has messages waiting in it and we need to read and process them.
    /// These messages are subject only to one serialize + deserialize sequence
    /// (which inspectedWindow.eval() uses internally).
    return this.remoteExecute('inspectedApplication.readMessageQueue()')
      .then(result => {
        const encode = value => JSON.stringify(value);

        for (const message of result) {
          const respond = (response: MessageResponse<any>) => {
            this.remoteExecute(`inspectedApplication.response(${encode(response)})`);
          };

          processor(message, respond);
        }
      })
      .catch(error => {
        throw new Error(`Failed to read message queue: ${error.stack || error.message}`);
      });
  }

  private remoteExecute(code: string): Promise<any> {
    return new Promise((resolve, reject) => {
      type ExceptionInfo = chrome.devtools.inspectedWindow.EvaluationExceptionInfo;

      const handler = (result, exceptionInfo: ExceptionInfo) => {
        if (exceptionInfo && (exceptionInfo.isError || exceptionInfo.isException)) {
          const e = new Error('Code evaluation failed');
          if (exceptionInfo.isException) {
            e.stack = exceptionInfo.value;
          }
          reject(e);
        } else {
          resolve(result);
        }
      };

      chrome.devtools.inspectedWindow.eval(code, handler);
    });
  }
}
