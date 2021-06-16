type Key = symbol | string;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventHandler = (...args: any[]) => void;

export type RegisterOptions = {
  override?: boolean;
  append?: boolean;
  insertBefore?: number;
};

export class EventBus {
  private EventMap: Map<Key, EventHandler[]> = new Map();
  /**
   * register event handler by key, default mode is override.
   * @param key
   * @param handler
   * @param options
   * @returns current event handlers under the key
   */
  public register(
    key: Key,
    handler: EventHandler,
    options: RegisterOptions = {},
  ): EventHandler[] {
    const { override, append, insertBefore } = options;
    if (override) {
      if (append || insertBefore !== undefined) {
        console.warn(
          'Append and insertBefore is invalid when override is true',
        );
      }
      this.EventMap.set(key, [handler]);
    } else if (append) {
      if (insertBefore !== undefined) {
        console.warn('InsertBefore is invalid when override is true');
      }
      if (!this.EventMap.has(key)) {
        this.EventMap.set(key, []);
      }
      const handlers = this.EventMap.get(key)!;
      handlers.push(handler);
    } else if (insertBefore !== undefined) {
      if (!this.EventMap.has(key)) {
        this.EventMap.set(key, []);
      }
      const handlers = this.EventMap.get(key)!;
      handlers.splice(insertBefore, 0, handler);
    } else {
      this.EventMap.set(key, [handler]);
    }
    return this.EventMap.get(key) || [];
  }

  /**
   * unregister event by key, target is an optional param to specify which handler to unregister, if not pass will remove all the event belongs to the key.
   * @param key
   * @param target
   * @returns remaining event handlers under the key;
   */
  public unregister(key: Key, target?: EventHandler): EventHandler[] {
    const handlers = this.EventMap.get(key);
    if (!handlers) {
      console.warn('Cannot unregister unregistered event');
      return [];
    }
    if (target === undefined) {
      handlers.length = 0;
    } else if (target) {
      const index = handlers.indexOf(target);
      if (index === -1) {
        console.warn('Unregistered function');
      } else {
        handlers.splice(index, 1);
      }
    }
    return handlers;
  }

  /**
   * invoke events handler by order;
   * @param key
   * @param evt
   * @returns void
   */
  public invoke(key: Key, ...args: any[]): void {
    const handlers = this.EventMap.get(key);
    if (handlers && handlers.length) {
      for (let i = 0; i < handlers.length; i++) {
        handlers[i](...args);
      }
    } else {
      throw new Error('Cannot invoke unregistered function');
    }
  }

  /**
   * create a new eventmap and replace the older one;
   */
  public dispose(): void {
    this.EventMap = new Map();
  }
}
