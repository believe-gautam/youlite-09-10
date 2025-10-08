// src/utils/EventEmitter.ts
class EventEmitter {
  private listeners: { [event: string]: ((...args: any[]) => void)[] } = {};

  addListener(event: string, fn: (...args: any[]) => void): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(fn);
    return () => this.removeListener(event, fn);
  }

  removeListener(event: string, fn: (...args: any[]) => void): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((f) => f !== fn);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((fn) => fn(...args));
  }
}

export const AppEvents = new EventEmitter();
