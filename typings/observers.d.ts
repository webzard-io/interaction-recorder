import { EventEmitter2 } from 'eventemitter2';
export interface IObserver {
    name: string;
    emitter: EventEmitter2;
    start(): void;
    stop(): void;
    suspend(): void;
}
export declare class EventObserver implements IObserver {
    name: string;
    emitter: EventEmitter2;
    private win;
    private onEmit;
    private handlers;
    private state;
    private throttleManager;
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
