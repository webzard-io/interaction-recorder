import { ThrottleManager } from '../util/throttler';
import { EventEmitter2 } from 'eventemitter2';
import { EventProcessor, IObserver, ObserverListener } from './type';
export declare abstract class AbstractObserver<TEvent, TOutput> implements IObserver<TOutput> {
    abstract name: string;
    abstract emitter: EventEmitter2;
    abstract start(): void;
    abstract stop(): void;
    abstract suspend(): void;
    private static throttleManager;
    protected preprocess: EventProcessor<TEvent, TOutput>;
    protected getThrottler: typeof ThrottleManager.prototype.getThrottle;
    protected invokeAll: typeof ThrottleManager.prototype.invokeAll;
    constructor(preprocess: EventProcessor<TEvent, TOutput>);
    protected onEmit(event: TEvent, args: any[], fromThrottler?: boolean): void;
    on(listener: ObserverListener<TOutput>): ObserverListener<TOutput>;
    off(listener: ObserverListener<TOutput>): void;
}
