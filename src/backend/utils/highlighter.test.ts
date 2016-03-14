import * as test from 'tape';
import Highlighter from './highlighter';

test('utils/highlighter: passing undefined', t => {
  t.plan(1);
  const hls = Highlighter.highlight(undefined, undefined);

  t.deepEqual(hls, undefined, 'get undefined highlight');
  t.end();
})

test('utils/highlighter: test highlight', t => {
  t.plan(3);
  document.body.innerHTML = '';

  const div = document.createElement('div');
  div.setAttribute('value', 'value');

  const node = document.createTextNode('innerText');
  div.appendChild(node);

  const hls = Highlighter.highlight(div, 'highlight div');

  t.deepEqual(document.getElementsByTagName('div')[0].textContent, 'highlight div',
     'get highlighted text');
  t.deepEqual(document.getElementsByTagName('div')[0].style.padding, '5px',
    'get highlighted padding');
  t.deepEqual(document.getElementsByTagName('div')[0].style.position,
    'absolute', 'get highlighted position');
  t.end();
})

test('utils/highlighter: test highlight', t => {
  t.plan(1);
  document.clear();

  const div = document.createElement('div');
  div.setAttribute('value', 'value');

  const node = document.createTextNode('innerText');
  div.appendChild(node);

  const hls = Highlighter.highlight(div, 'highlight div');
  Highlighter.clear();

  t.deepEqual(document.getElementsByTagName('div').length, 0,
    'remove all highlight');
  t.end();
})
