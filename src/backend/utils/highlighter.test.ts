import * as test from 'tape';

import {highlight} from './highlighter';

test('utils/highlighter: passing undefined', t => {
  t.plan(1);
  const hls = highlight([]);
  t.deepEqual(hls, undefined, 'get undefined highlight');
  t.end();
});

test('utils/highlighter: test highlight', t => {
  t.plan(2);
  document.body.innerHTML = '';

  const div = document.createElement('div');
  div.setAttribute('value', 'value');

  const node = document.createTextNode('innerText');
  div.appendChild(node);

  document.body.appendChild(div);

  const hls = highlight(
    <any> [{id: '0', nativeElement: () => div, name: 'highlight div'}]);

  const all = document.querySelectorAll('div');
  const h: any = all[all.length - 1];

  t.deepEqual(h.style.padding, '5px', 'get highlighted padding');
  t.deepEqual(h.style.position, 'absolute', 'get highlighted position');

  t.end();
});

test('utils/highlighter: test highlight', t => {
  t.plan(1);
  document.clear();

  const div = document.createElement('div');
  div.setAttribute('value', 'value');

  const node = document.createTextNode('innerText');
  div.appendChild(node);

  document.body.appendChild(div);

  const hls = highlight(
    <any> [{id: '1', nativeElement: () => div, name: 'foo'}]);

  highlight([]);
  t.deepEqual(document.getElementsByTagName('div').length, 3,
    'remove all highlight');
  t.end();
});
