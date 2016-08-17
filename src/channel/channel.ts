import {messageTimeout} from '../utils/configuration';
import {getMessageIdentifier} from './identifier';
import {dispatch} from './dispatch';

type Message = any;

const connections = new Map<number, chrome.runtime.Port>();

const pendingMessages = new Map<string, (response) => void>();

export const sendToBrowser =
    <Response, Request>(message: Request): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const tabId = chrome.devtools.inspectedWindow.tabId;

    if (!connections.has(tabId)) {
      reject(new Error(`Attempted to send message to nonexistent backend listener (tab ${tabId})`));
    }

    const msgid = getMessageIdentifier();

    const timeoutfn = () =>
      reject(new Error(`Timeout waiting for message response (ID ${msgid})`));

    const timeout = setTimeout(timeoutfn, messageTimeout);

    pendingMessages.set(msgid,
      response => {
        /// Stop the timeout handler
        clearTimeout(timeout);

        resolve(response);
      });

    const port = connections.get(tabId);

    port.postMessage({messageId: msgid, request: message});
  });
};

const respondToBrowserMessage = <T>(tabId: number, messageId: string, response: T) => {
  const port = connections.get(tabId);
  if (port == null) {
    throw new Error(`Attempted to send message to nonexistent tab (${tabId})`);
  }

  port.postMessage({tabId, messageResponseId: messageId, response});
};

chrome.runtime.onConnect.addListener(port => {
  debugger;

  const tabId = port.sender.tab.id;
  if (connections.has(tabId)) {
    throw new Error(`Received superfluous onConnect message for tab ID ${tabId}`);
  }

  connections.set(port.sender.tab.id, port);

  const messageHandler = (message: Message, p) => {
    if (typeof message.messageResponseId === 'string') {
      const handler = pendingMessages.get(message.messageResponseId);
      try {
        handler(message.response);
      }
      finally {
        pendingMessages.delete(message.messageResponseId);
      }
    }
    else {
      try {
        const response = dispatch(message.request);

        port.postMessage({tabId, messageResponseId: message.messageId, response});
      }
      catch (error) {
        console.error(`Failed to dispatch backend message ${message.messageId}: ${error.stack}`);
      }
    }
  };

  port.onMessage.addListener(messageHandler);

  port.onDisconnect.addListener(p => {
    p.onMessage.removeListener(messageHandler);

    /// Remove this connection from our map
    connections.delete(port.sender.tab.id);
  });
});

chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    debugger;
    try {
      sendResponse(dispatch(message));
    }
    catch (error) {
      sendResponse({error});
    }
  });