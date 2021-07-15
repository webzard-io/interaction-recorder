import { EventObserver } from './observers';
import { Recorder, RecorderOptions } from './recorder';
export declare class InteractionRecorder {
    private _observer;
    get observer(): EventObserver;
    private _recorder;
    get recorder(): Recorder;
    constructor(win: Window, options: Omit<RecorderOptions, 'matcher'>);
    start(): void;
    suspend(): void;
    stop(): void;
}
