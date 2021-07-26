import { MachineMatcherInput, MatcherStep } from './matcher/types';
import { EventObserver } from './observers';
import { Recorder } from './recorder';
import { StepEvent } from './types';
export declare type InteractionRecorderOptions = {
    onNewStep: (step: MatcherStep) => void;
    onEndStep: (step: MatcherStep) => void;
    onUpdateStep: (step: MatcherStep) => void;
};
export declare class InteractionRecorder {
    private serializer;
    private _observer;
    get observer(): EventObserver<MachineMatcherInput>;
    private _recorder;
    get recorder(): Recorder<StepEvent, MachineMatcherInput>;
    constructor(win: Window, options?: InteractionRecorderOptions);
    start(): void;
    suspend(): void;
    stop(): void;
}
