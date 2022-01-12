import { EventEmitter2 } from 'eventemitter2';
import { AbstractObserver } from './abstractObserver';
import { EventObserverStepEvent, EventProcessor } from './type';
export declare class EventObserver<TOutput> extends AbstractObserver<EventObserverStepEvent, TOutput> {
    name: string;
    emitter: EventEmitter2;
    private win;
    private handlers;
    private state;
    private previousDragOverTarget;
    constructor(win: Window, preprocess: EventProcessor<EventObserverStepEvent, TOutput>);
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
