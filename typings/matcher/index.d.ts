import { EventEmitter2 } from 'eventemitter2';
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
export declare type MachineMatcherOptions = {
    emitter: EventEmitter2;
    onNewStep?: (step: MatcherStep) => void;
    onUpdateStep?: (step: MatcherStep) => void;
    onEndStep?: (step: MatcherStep) => void;
};
export * from './types';
export declare class MachineMatcher implements IMatcher<MachineMatcherInput> {
    machine: MatcherMachine;
    emitter: EventEmitter2;
    private state;
    private handler;
    constructor(options: MachineMatcherOptions);
    start(): void;
    suspend(): void;
    stop(): void;
    private emitStep;
    listen(input: MachineMatcherInput): void;
}
