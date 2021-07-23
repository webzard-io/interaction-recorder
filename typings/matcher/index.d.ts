import { EventEmitter2 } from 'eventemitter2';
import { MatcherMachine } from './machine';
import { MatcherStep } from './types';
export interface IMatcher {
    emitter: EventEmitter2;
    start(): void;
    suspend(): void;
    stop(): void;
}
export declare type MachineMatcherOptions = {
    emitter: EventEmitter2;
    onNewStep?: (step: MatcherStep) => void;
    onUpdateStep?: (step: MatcherStep) => void;
    onEndStep?: (step: MatcherStep) => void;
};
export declare class MachineMatcher implements IMatcher {
    machine: MatcherMachine;
    emitter: EventEmitter2;
    private state;
    private handler;
    constructor(options: MachineMatcherOptions);
    start(): void;
    suspend(): void;
    stop(): void;
    private emitStep;
}
