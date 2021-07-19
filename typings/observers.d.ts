import { StepEvent } from './types';
import { ThrottleManager } from './util/throttler';
import { EventEmitter2 } from 'eventemitter2';
export interface IObserver {
    name: string;
    emitter: EventEmitter2;
    start(): void;
    stop(): void;
    suspend(): void;
}
export declare abstract class AbstractObserver implements IObserver {
    abstract name: string;
    abstract emitter: EventEmitter2;
    abstract start(): void;
    abstract stop(): void;
    abstract suspend(): void;
    private static throttleManager;
    protected getThrottle: typeof ThrottleManager.prototype.getThrottle;
    protected invokeAll: typeof ThrottleManager.prototype.invokeAll;
    constructor();
    protected onEmit(event: StepEvent, target: HTMLElement | null, fromThrottler?: boolean): void;
}
export declare class EventObserver extends AbstractObserver {
    name: string;
    emitter: EventEmitter2;
    private win;
    private handlers;
    private state;
    constructor(win: Window);
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
    private get now();
    private get active();
}
