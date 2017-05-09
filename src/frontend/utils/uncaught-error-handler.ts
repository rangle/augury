import {
  ErrorHandler,
} from '@angular/core';

export class UncaughtErrorHandler implements ErrorHandler {
  listeners: Array<(err: Error) => void> = [];

  addListener(listener: (err: Error) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  handleError(err: Error): void {
    this.listeners.forEach(fn => fn(err));
  }
}
