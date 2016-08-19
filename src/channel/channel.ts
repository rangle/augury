import {MessageType} from '../communication';

let connections = new Map<number, chrome.runtime.Port>();
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

chrome.runtime.onConnect.addListener(port => {

  let frontendListener = (message, sender) => {

    if (connections.has(message.tabId) === false) {
      connections.set(message.tabId, port);
    }

    chrome.tabs.sendMessage(message.tabId, message);
    // other message handling
  };

  // Listen to messages sent from the DevTools page
  port.onMessage.addListener(frontendListener);

  port.onDisconnect.addListener(_port => {

    _port.onMessage.removeListener(frontendListener);
    connections.forEach((value, key, map) => {
      if (value === port) {
        map.delete(key);
      }
    });
  });

});
