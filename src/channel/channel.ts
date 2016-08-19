import {MessageType} from '../communication';

const connections = new Map<number, chrome.runtime.Port>();

/// A queue of messages that were not able to be delivered and will be
/// retried when the connection to the content script or extension is
/// re-established
const buffer = new Map<number, Array<any>>();

const drainQueue = (tabId: number, buffer: Array<any>) => {
  if (buffer == null || buffer.length === 0) {
    return;
  }

  const port = connections.get(tabId);

  const remove = new Array<number>();

  buffer.forEach((b, index: number) => {
    try {
      port.postMessage(b.message);

      // If the post did not throw an exception, then we can remove it from the buffer
      remove.push(index);
    }
    catch (error) {
      // Will retry again in a moment
    }
  });

  for (const index of remove.reverse()) {
    buffer.splice(index, 1);
  }
}

chrome.runtime.onMessage.addListener(
 (message, sender, sendResponse) => {
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
      let queue = buffer.get(sender.tab.id);
      if (queue == null) {
        queue = new Array<any>();
        buffer.set(sender.tab.id, queue);
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

    drainQueue(message.tabId, buffer.get(message.tabId));

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
