import {MessageType} from '../communication';

chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    if (message.messageType === MessageType.Initialize) {
      sendResponse({
        extensionId: chrome.runtime.id
      });
    }

    if (sender.tab) {
      const connection = connections.get(sender.tab.id);
      if (connection) {
        connection.postMessage(message);
      }
    }

    return true;
  });

let connections = new Map<number, chrome.runtime.Port>();

chrome.runtime.onConnect.addListener(port => {
  console.log('connection', port);

  let frontendListener = (message, sender) => {
    debugger;
    if (message.tabId) {
      connections.set(message.tabId, port);
    }

    chrome.tabs.sendMessage(message.tabId, message);
  };

  // Listen to messages sent from the DevTools page
  port.onMessage.addListener(frontendListener);

  port.onDisconnect.addListener(_port => {
    debugger;
    _port.onMessage.removeListener(frontendListener);

    connections.forEach((value, key, map) => {
      if (value === port) {
        map.delete(key);
      }
    });
  });

});