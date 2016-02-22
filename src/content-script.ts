let count = 0;

const injectEntry = () => {
  if (count === 0) {

    let script = document.createElement('script');
    script.src = chrome.extension.getURL('build/backend.js');
    document.documentElement.appendChild(script);
    script.parentNode.removeChild(script);

    count++;
  }
};

// Check with background script to see if the current tab was
// already registered. If so, then this is a reload.
chrome.runtime.sendMessage({
    from: 'content-script'
  }, (response) => {
    if (response.connection) {
      injectEntry();
    }
  });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.name === 'init') {
    injectEntry();
    return;
  }

  window.postMessage({ type: 'BATARANGLE_CONTENT_SCRIPT', message }, '*');
  return true;
});

window.addEventListener('message', function(event) {
  // We only accept messages from ourselves
  if (event.source !== window) {
    return;
  }

  if (event.data.type && (event.data.type === 'BATARANGLE_INSPECTED_APP')) {
    chrome.runtime.sendMessage({
      name: 'message',
      data: event.data
    });
  }
}, false);
