import {
  MutableTree,
  Node,
} from '../../tree';

export interface Offsets {
  x: number;
  y: number;
  w: number;
  h: number;
}

const styles = require('to-string!raw!./highlighter.raw');

let highlights = new Map<string, HTMLElement>();

const offsets = (node): Offsets => {
  const vals = {
    x: node.offsetLeft,
    y: node.offsetTop,
    w: node.offsetWidth,
    h: node.offsetHeight
  };

  while (node = node.offsetParent) {
    vals.x += node.offsetLeft;
    vals.y += node.offsetTop;
  }
  return vals;
};

const highlightNode = (node, label: string): HTMLElement => {
  if (node == null) {
    return;
  }
  ;

  const overlay = document.createElement('div');
  overlay.setAttribute('style', styles);
  if (label) {
    overlay.textContent = label;
  }

  const pos = offsets(node);
  overlay.style.left = `${pos.x}px`;
  overlay.style.top = `${pos.y}px`;
  overlay.style.width = `${pos.w}px`;
  overlay.style.height = `${pos.h}px`;

  document.body.appendChild(overlay);

  return overlay;
};

export const clear = (map) => {
  map.forEach(
    (value, key) => {
      try {
        value.remove();
      }
      catch (e) {
      }
    });
};

export const highlight = (nodes: Array<Node>) => {
  if (nodes == null || nodes.length === 0) {
    clear(highlights);
    return;
  }

  const elements = new Array<HTMLElement>();
  const map = new Map<string, HTMLElement>();

  for (const node of nodes.filter(n => n != null)) {
    const element = highlightNode(node.nativeElement(), node.name);
    elements.push(element);

    map.set(node.id, element);
  }

  highlights = map;

  return {
    elements,
    map
  };
};
