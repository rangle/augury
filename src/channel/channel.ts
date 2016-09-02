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

  const remove = new Array<number>();

  const send = (m: Message<any>, index: number) => {
    try {
      port.postMessage(m);
      remove.push(index);
    }
    catch (error) {} // retry later
  };

  buffer.forEach(send);

  for (const index of remove.reverse()) {
    buffer.splice(index, 1);
  }
};

chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    console.log('got msg from backend', message);

    if (message.messageType === MessageType.Initialize) {
        sendResponse({ // note that this is separate from our message response system
          extensionId: chrome.runtime.id
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
        catch (err) {}
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
    console.log('got msg from frontend', message);

    if (connections.has(message.tabId) === false) {
      connections.set(message.tabId, port);
    }

    drainQueue(message.tabId, messageBuffer.get(message.tabId));

    chrome.tabs.sendMessage(message.tabId, message);
  };

  port.onMessage.addListener(listener);

  port.onDisconnect.addListener(() => {
    port.onMessage.removeListener(<any> listener);

    connections.forEach((value, key, map) => {
      if (value === port) {
        map.delete(key);
      }
    });
  });
});
