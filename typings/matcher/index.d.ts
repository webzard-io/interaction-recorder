import { EventEmitter2 } from 'eventemitter2';
import { BaseStepEvent } from '../types';
import { MatcherMachine } from './machine';
import { MachineMatcherInput, MatcherStep } from './types';
export interface IMatcher<TInput> {
    emitter: EventEmitter2;
    start(): void;
    suspend(): void;
    stop(): void;
    listen: MatcherListener<TInput>;
}
export declare type MatcherListener<TInput> = (input: TInput) => void;
export declare type MachineMatcherOptions<TStepEvent extends BaseStepEvent = BaseStepEvent> = {
    emitter: EventEmitter2;
    onNewStep?: (step: MatcherStep<TStepEvent>) => void;
    onUpdateStep?: (step: MatcherStep<TStepEvent>) => void;
    onEndStep?: (step: MatcherStep<TStepEvent>) => void;
};
export * from './types';
export declare class MachineMatcher<TStepEvent extends BaseStepEvent = BaseStepEvent> implements IMatcher<MachineMatcherInput<TStepEvent>> {
    machine: MatcherMachine<TStepEvent>;
    emitter: EventEmitter2;
    private state;
    private handler;
    constructor(options: MachineMatcherOptions<TStepEvent>);
    start(): void;
    suspend(): void;
    stop(): void;
    private emitStep;
    listen(input: MachineMatcherInput<TStepEvent>): void;
}
