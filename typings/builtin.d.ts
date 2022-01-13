import { MachineMatcherInput, MatcherElement, MatcherStep } from './matcher/types';
import { EventObserver, EventObserverStepEvent } from './observer';
import { Recorder } from './recorder';
export declare type InteractionRecorderOptions = {
    onNewStep: (step: MatcherStep<EventObserverStepEvent>) => void;
    onEndStep: (step: MatcherStep<EventObserverStepEvent>) => void;
    onUpdateStep: (step: MatcherStep<EventObserverStepEvent>) => void;
};
export declare class ElementSerializer {
    private ElementMap;
    private idMap;
    constructor();
    getElementById(id: string): HTMLElement | undefined;
    getSerializedItem(ele: HTMLElement | Window | null): MatcherElement | null;
    private serializeAttribute;
    getIdByElement(element: HTMLElement | null): string | undefined;
}
export declare class InteractionRecorder {
    private serializer;
    private _observer;
    get observer(): EventObserver<MachineMatcherInput<EventObserverStepEvent>>;
    private _recorder;
    get recorder(): Recorder<EventObserverStepEvent, MachineMatcherInput<EventObserverStepEvent>>;
    constructor(win: Window, options?: InteractionRecorderOptions);
    start(): void;
    suspend(): void;
    stop(): void;
}
