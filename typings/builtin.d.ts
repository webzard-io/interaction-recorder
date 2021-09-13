import { MachineMatcherInput, MatcherElement, MatcherStep } from './matcher/types';
import { EventObserver } from './observers';
import { Recorder } from './recorder';
import { StepEvent } from './types';
export declare type InteractionRecorderOptions = {
    onNewStep: (step: MatcherStep) => void;
    onEndStep: (step: MatcherStep) => void;
    onUpdateStep: (step: MatcherStep) => void;
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
    get observer(): EventObserver<MachineMatcherInput>;
    private _recorder;
    get recorder(): Recorder<StepEvent, MachineMatcherInput>;
    constructor(win: Window, options?: InteractionRecorderOptions);
    start(): void;
    suspend(): void;
    stop(): void;
}
