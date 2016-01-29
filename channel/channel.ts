let connections = new Map<number, chrome.runtime.Port>();

chrome.runtime.onConnect.addListener(port => {

  let frontendListener = (message, sender) => {
    // The original connection event doesn't include the tab ID of the
    // DevTools page, so we need to send it explicitly.
    if (message.name === 'init') {
      connections.set(message.tabId, port);
      // return;
    }

    if (connections.has(message.tabId)) {
      // chrome.tabs.sendMessage(message.tabId, message);
      // return;
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

// Receive message from content script and
// relay to the devTools page for the current tab
chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    // Messages from content scripts should have sender.tab set
    if (sender.tab) {
      if (connections.has(sender.tab.id)) {
        console.log('Channel: Sending message to Frontend', message, sender);
        connections.get(sender.tab.id).postMessage(message);
      } else {
        console.log('Tab not found in connection list.');
      }
    } else {
      console.log('sender.tab not defined.');
    }

    return true;
  });
