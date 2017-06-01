const initializeGTM = function (w, d, s, l, i) {
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
};

const GoogleTagManager = initializeGTM(window, document, 'script', 'dataLayer', 'GTM-NTK59FH');

export default (tag) => (window as any).dataLayer.push(tag);
