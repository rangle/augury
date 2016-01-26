export default class Highlighter {

  private static hls = [];

  static offsets(node: any): any {
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

  public static highlight(node: any, label: string): any {
    let box = document.createElement('div');
    box.className = 'ngi-hl ngi-hl-scope';
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
    return box;
  }

  public static clear(): void {
    let box;
    while (box = this.hls.pop()) {
      box.parentNode.removeChild(box);
    }
  }
}
