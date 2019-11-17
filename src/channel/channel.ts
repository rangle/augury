import {
  Message,
  MessageType,
} from '../communication';

const connections = new Map<number, chrome.runtime.Port>();

/// A queue of messages that were not able to be delivered and will be
/// retried when the connection to the content script or extension is
/// re-established
const messageBuffer = new Map<number, Array<any>>();

const drainQueue = (port: chrome.runtime.Port, buffer: Array<any>) => {
  if (buffer == null || buffer.length === 0) {
    return;
  }

  let removed = 0;

  const send = (m: Message<any>, index: number) => {
    port.postMessage(m);
    ++removed;
  };

  try {
    buffer.forEach(send);
  } catch (error) {
    // port disconnected, re-try on connect.
  }

  buffer.splice(0, removed);
};

chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    if (message.messageType === MessageType.Initialize) {
      sendResponse({ // note that this is separate from our message response system
        extensionId: chrome.runtime.id
      });
    } else if (message.messageType === MessageType.NgApp) {
      // if angular was detected, show colourful icon
      chrome.browserAction.setIcon({
        path: {
          '16': 'images/icon16.png',
          '48': 'images/icon48.png',
          '128': 'images/icon128.png',
        },
        tabId: sender.tab.id,
      });
    }

    if (sender.tab) {
      let sent = false;

      const connection = connections.get(sender.tab.id);
      if (connection) {
        try {
          connection.postMessage(message);
          sent = true;
        }
        catch (err) { }
      }

      if (sent === false) {
        let queue = messageBuffer.get(sender.tab.id);
        if (queue == null) {
          queue = new Array<any>();
          messageBuffer.set(sender.tab.id, queue);
        }

        queue.push(message);
      }
    }
    return true;
  });

chrome.runtime.onConnect.addListener(port => {
  const listener = (message, sender) => {
    if (connections.has(message.tabId) === false) {
      connections.set(message.tabId, port);
    }

    drainQueue(message.tabId, messageBuffer.get(message.tabId));

    chrome.tabs.sendMessage(message.tabId, message);
  };

  port.onMessage.addListener(listener);

  port.onDisconnect.addListener(() => {
    port.onMessage.removeListener(<any>listener);

    connections.forEach((value, key, map) => {
      if (value === port) {
        map.delete(key);
      }
    });
  });
});
