export type throttleOptions = {
  leading?: boolean;
  trailing?: boolean;
};

export interface IThrottler {
  invoker: (() => void) | null;
  timeout: number | null;
  previous: number;
}

export class ThrottleManager {
  private throttlerMap = new Map<symbol, IThrottler>();

  public getThrottle<T>(
    throttleDivider: ((...args: any[]) => symbol) | symbol,
    func: (arg: T) => void,
    wait: number,
    options: throttleOptions = {},
  ) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const manager = this;
    const throttleFn = function (this: any, ...args: any) {
      // generate key
      const key: symbol =
        throttleDivider instanceof Function
          ? throttleDivider.apply(this, args)
          : throttleDivider;
      if (!manager.throttlerMap.has(key)) {
        const newThrottler: IThrottler = {
          invoker: null,
          timeout: null,
          previous: 0,
        };
        manager.throttlerMap.set(key, newThrottler);
      }
      const throttler = manager.throttlerMap.get(key)!;

      const now = Date.now();
      if (!throttler.previous && options.leading === false) {
        throttler.previous = now;
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const remaining = wait - (now - throttler.previous);
      if (remaining <= 0 || remaining > wait) {
        if (throttler.timeout) {
          window.clearTimeout(throttler.timeout);
          throttler.timeout = null;
        }
        throttler.previous = now;
        func.apply(this, args);
        throttler.invoker = null;
      } else if (!throttler.timeout && options.trailing !== false) {
        const debouncedFn = () => {
          throttler.previous = options.leading === false ? 0 : Date.now();
          throttler.timeout && clearTimeout(throttler.timeout);
          throttler.timeout = null;
          func.apply(this, args);
          throttler.invoker = null;
        };
        throttler.timeout = window.setTimeout(debouncedFn, remaining);
        throttler.invoker = debouncedFn;
      }
    };
    return throttleFn;
  }

  public invokeAll(): void {
    this.throttlerMap.forEach((throttler) => {
      throttler.invoker && throttler.invoker();
    });
  }
}
