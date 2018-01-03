import { MessageType } from '../communication';

const initializeGTM = (w, d, s, l, i) => {
  w[l] = w[l] || [];
  w[l].push({
    'gtm.start': new Date().getTime(),
    'event': 'gtm.js'
  });

  let f = d.getElementsByTagName(s)[0],
    j = d.createElement(s),
    dl = l !== 'dataLayer' ? '&l=' + l : '';

  j.async = true;
  j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
  f.parentNode.insertBefore(j, f);

  chrome.runtime.onMessage.addListener((message) => {
    if (message && message.messageType === MessageType.GoogleTagManagerSend) {
      pushTag(message.content);
    }
  });
};

const pushTag = (tag) => (window as any).dataLayer.push(tag);

initializeGTM(window, document, 'script', 'dataLayer', 'GTM-NTK59FH');
