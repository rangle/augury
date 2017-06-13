import { highlight } from './highlighter';

test('utils/highlighter: passing undefined', () => {
  const hls = highlight([]);
  expect(hls).toBeUndefined();
});

test('utils/highlighter: test highlight', () => {
  document.body.innerHTML = '';

  const div = document.createElement('div');
  div.setAttribute('value', 'value');

  const node = document.createTextNode('innerText');
  div.appendChild(node);

  document.body.appendChild(div);

  const hls = highlight(<any>[{ id: '0', nativeElement: () => div, name: 'highlight div' }]);

  const all = document.querySelectorAll('div');
  const h: any = all[all.length - 1];

  expect(h.style.padding).toBe('5px');
  expect(h.style.position).toBe('absolute');
});

test('utils/highlighter: test highlight', () => {
  const div = document.createElement('div');
  div.setAttribute('value', 'value');

  const node = document.createTextNode('innerText');
  div.appendChild(node);

  document.body.appendChild(div);

  const hls = highlight(<any>[{ id: '1', nativeElement: () => div, name: 'foo' }]);

  highlight([]);
  expect(document.getElementsByTagName('div').length).toBe(3);
});
