import {MessageType} from '../communication';

const connections = new Map<number, chrome.runtime.Port>();

chrome.runtime.onMessage.addListener(
 (message, sender, sendResponse) => {
    if (message.messageType === MessageType.Initialize) {
      sendResponse({ // note that this is separate from our message response system
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

chrome.runtime.onConnect.addListener(port => {
  const listener = (message, sender) => {
    if (connections.has(message.tabId) === false) {
      connections.set(message.tabId, port);
    }

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
