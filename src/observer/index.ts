import { ThrottleManager } from '../util/throttler';
import { EventEmitter2 } from 'eventemitter2';

declare global {
  interface UIEvent {
    path: Array<HTMLElement>;
  }
}

export interface IObserver<TOutput> {
  name: string;
  emitter: EventEmitter2;
  start(): void;
  stop(): void;
  suspend(): void;
  on(listenerFn: ObserverListener<TOutput>): ObserverListener<TOutput>;
  off(listenerFn: ObserverListener<TOutput>): void;
}

export type ObserverListener<TOutput> = (output: TOutput) => void;

export type EventProcessor<TEvent, TOutput> = (
  event: TEvent,
  ...args: any[]
) => TOutput;

export abstract class AbstractObserver<TEvent, TOutput>
  implements IObserver<TOutput>
{
  abstract name: string;
  abstract emitter: EventEmitter2;

  abstract start(): void;
  abstract stop(): void;
  abstract suspend(): void;

  private static throttleManager = new ThrottleManager();
  protected preprocess: EventProcessor<TEvent, TOutput>;
  protected getThrottler: typeof ThrottleManager.prototype.getThrottle;
  protected invokeAll: typeof ThrottleManager.prototype.invokeAll;

  constructor(preprocess: EventProcessor<TEvent, TOutput>) {
    this.getThrottler = (...args) => {
      return AbstractObserver.throttleManager.getThrottle(...args);
    };

    this.invokeAll = () => {
      return AbstractObserver.throttleManager.invokeAll();
    };
    this.preprocess = preprocess;
  }

  protected onEmit(event: TEvent, args: any[], fromThrottler = false) {
    !fromThrottler && AbstractObserver.throttleManager.invokeAll();
    this.emitter.emit(`observer.${this.name}`, this.preprocess(event, ...args));
  }

  public on(listener: ObserverListener<TOutput>): ObserverListener<TOutput> {
    this.emitter.on(`observer.${this.name}`, listener);
    return listener;
  }

  public off(listener: ObserverListener<TOutput>): void {
    this.emitter.off(`observer.${this.name}`, listener);
  }
}

export { EventObserver } from './eventObserver';
export * from './type';
