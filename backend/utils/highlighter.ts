export default class Highlighter {

  private static hls = [];
  private static  CSS_STYLE: string = `
    padding: 5px;
    font-size: 11px;
    line-height: 11px;
    position: absolute;
    text-align: right;
    z-index: 9999999999999 !important;
    pointer-events: none;
    min-height: 5px;
    background: rgba(126, 183, 253, 0.3);
    border: 1px solid rgba(126, 183, 253, 0.7) !important;
    color: #6da9d7 !important;
  `;

  private static offsets(node: any): any {
    let vals = {
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
  }

  static highlight(node: any, label: string): void {
    if (!node) {
      return;
    };

    let box = document.createElement('div');
    box.setAttribute('style', this.CSS_STYLE);
    if (label) {
      box.textContent = label;
    }
    let pos = this.offsets(node);
    box.style.left = pos.x + 'px';
    box.style.top = pos.y + 'px';
    box.style.width = pos.w + 'px';
    box.style.height = pos.h + 'px';
    document.body.appendChild(box);
    this.hls.push(box);
  }

  static clear(): void {
    let box;
    while (box = this.hls.pop()) {
      box.parentNode.removeChild(box);
    }
  }
}
