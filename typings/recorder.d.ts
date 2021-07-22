import { IMatcher } from './matcher';
import { AbstractObserver } from './observers';
export declare type RecorderOptions = {
    matcher: IMatcher;
};
export declare class Recorder {
    private observersList;
    private listenerMap;
    private matcher;
    private _state;
    get state(): 'active' | 'inactive' | 'suspend';
    constructor(options: RecorderOptions);
    start(): void;
    suspend(): void;
    stop(): void;
    extendObserver(observer: AbstractObserver): AbstractObserver;
    removeObserver(observer: AbstractObserver): void;
}
