export class MessageQueue<T> {
  private queue = new Array<T>();

  /// Empty the queue
  clear() {
    this.queue = [];
  }

  /// Add a new message to the queue
  enqueue(element: T) {
    this.queue.push(element);
  }

  /// Read all the messages in the queue and remove them in one operation
  dequeue(): Array<T> {
    const q = this.queue;
    this.queue = [];
    return q;
  }
}
