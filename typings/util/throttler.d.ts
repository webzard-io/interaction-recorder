export declare type throttleOptions = {
    leading?: boolean;
    trailing?: boolean;
};
export interface IThrottler {
    invoker: (() => void) | null;
    timeout: number | null;
    previous: number;
    key: symbol;
}
export declare class ThrottleManager {
    private throttlerMap;
    private pendingFnSet;
    getThrottle<T>(throttleDivider: ((...args: any[]) => symbol) | symbol, func: (arg: T) => void, wait: number, options?: throttleOptions): (this: any, ...args: any) => void;
    invokeAll(): void;
}
