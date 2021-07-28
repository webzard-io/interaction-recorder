import { StepEvent } from './types';
import { ThrottleManager } from './util/throttler';
import { EventEmitter2 } from 'eventemitter2';
export interface IObserver<TOutput> {
    name: string;
    emitter: EventEmitter2;
    start(): void;
    stop(): void;
    suspend(): void;
    on(listenerFn: ObserverListener<TOutput>): ObserverListener<TOutput>;
    off(listenerFn: ObserverListener<TOutput>): void;
}
export declare type ObserverListener<TOutput> = (output: TOutput) => void;
export declare type EventProcessor<TEvent, TOutput> = (event: TEvent, ...args: any[]) => TOutput;
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
export declare class EventObserver<TOutput> extends AbstractObserver<StepEvent, TOutput> {
    name: string;
    emitter: EventEmitter2;
    private win;
    private handlers;
    private state;
    private previousDragOverTarget;
    constructor(win: Window, preprocess: EventProcessor<StepEvent, TOutput>);
    start(): void;
    suspend(): void;
    stop(): void;
    private observeMouseInteractions;
    private observeMousemove;
    private observeScroll;
    private observeKeyboardInteractions;
    private observeTextInput;
    private observeBlur;
    private observeBeforeUnload;
    private observeWheel;
    private observerDrag;
    private observeFileInput;
    private get now();
    private get active();
}
