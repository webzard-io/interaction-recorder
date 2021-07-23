import { MatcherStep } from './matcher/types';
import { EventObserver } from './observers';
import { Recorder } from './recorder';
export declare type InteractionRecorderOptions = {
    onNewStep: (step: MatcherStep) => void;
    onEndStep: (step: MatcherStep) => void;
    onUpdateStep: (step: MatcherStep) => void;
};
export declare class InteractionRecorder {
    private _observer;
    get observer(): EventObserver;
    private _recorder;
    get recorder(): Recorder;
    constructor(win: Window, options?: InteractionRecorderOptions);
    start(): void;
    suspend(): void;
    stop(): void;
}
