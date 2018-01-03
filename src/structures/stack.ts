export class Stack<T> {
  private elements: Array<T> = [];

  get size(): number {
    return this.elements.length;
  }

  clear() {
    this.elements = [];
  }

  push(element: T) {
    this.elements.push(element);
  }

  pop(): T {
    if (this.elements.length === 0) {
      return null;
    }
    return this.elements.pop();
  }
}
