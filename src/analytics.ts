// needed to refactor the regular GA snippet to be compatible with our tslint

const initializeGA = function (i, s, o, g, r) {
  i.GoogleAnalyticsObject = r;

  Object.assign(i, {
    [r]: i[r] || function () {
    (i[r].q = i[r].q || []).push(arguments);
  } });

  i[r].l = 1 * (new Date() as any);
  let a = s.createElement(o);
  let m = s.getElementsByTagName(o)[0];
  a.async = 1;
  a.src = g;
  m.parentNode.insertBefore(a, m);
  return (window as any).ga;
};

const GA = initializeGA(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

GA('create', 'UA-82659841-1', 'auto');
GA('set', 'checkProtocolTask', function () {
});
GA('require', 'displayfeatures');

export default (eventType, data) => (window as any).ga('send', eventType, ...data);
