import { EventEmitter2 } from 'eventemitter2';
import { IObserver } from './observers';
import { Step, StepEvent } from './types';
export interface IMatcher {
    emitter?: EventEmitter2;
    start(): void;
    suspend(): void;
    stop(): void;
    extendAction(action: IExtendParams): void;
    removeAction(observer: IObserver): void;
}
export declare type PatternInterceptor = (matcher: IMatcher) => boolean;
export interface IExtendParams {
    observer: IObserver;
}
export declare enum EmitAction {
    RETURN = 1,
    EMIT = 2,
    CONTINUE = 3
}
export declare enum CollectAction {
    RETURN = 1,
    COLLECT = 2,
    CONTINUE = 3
}
export declare type PatternMatcherExtendParams = IExtendParams & {
    pattern?: (steps: StepEvent[]) => Step['action'] | 'UNKNOWN';
    actionBeforeCollectStep?: (matcher: PatternMatcher, newEvent: StepEvent, target: HTMLElement | null) => EmitAction;
    actionWhileCollectStep?: (matcher: PatternMatcher, newEvent: StepEvent, target: HTMLElement | null) => CollectAction;
    actionAfterCollectStep?: (matcher: PatternMatcher, newEvent: StepEvent, target: HTMLElement | null) => EmitAction;
};
export declare class PatternMatcher implements IMatcher {
    emitter?: EventEmitter2;
    currentTarget: HTMLElement | null;
    currentEvents: StepEvent[];
    private actionBeforeCollectStep;
    private actionWhileCollectStep;
    private actionAfterCollectStep;
    private patternMatcher;
    private state;
    start(): void;
    suspend(): void;
    stop(): void;
    extendAction(action: PatternMatcherExtendParams): void;
    removeAction(observer: IObserver): void;
    private matchPattern;
    private emitCurrentStep;
    private handleNewEvent;
    private collectEvent;
}
