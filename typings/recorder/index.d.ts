import { IMatcher } from '../matcher';
import { AbstractObserver } from '../observer';
export declare type RecorderOptions<TMiddleware> = {
    matcher: IMatcher<TMiddleware>;
};
export declare class Recorder<TEvent, TMiddleware> {
    private observersList;
    private listenerMap;
    private matcher;
    private _state;
    get state(): 'active' | 'inactive' | 'suspend';
    constructor(options: RecorderOptions<TMiddleware>);
    start(): void;
    suspend(): void;
    stop(): void;
    extendObserver(observer: AbstractObserver<TEvent, TMiddleware>): AbstractObserver<TEvent, TMiddleware>;
    removeObserver(observer: AbstractObserver<TEvent, TMiddleware>): void;
}
