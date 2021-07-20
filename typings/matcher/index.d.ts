import { EventEmitter2 } from 'eventemitter2';
import { Step } from '../types';
import { MatcherMachine } from './machine';
export interface IMatcher {
    emitter?: EventEmitter2;
    start(): void;
    suspend(): void;
    stop(): void;
}
export declare type MatcherStep = Omit<Step, 'selector'> & {
    target: HTMLElement | null;
};
export declare class PatternMatcher implements IMatcher {
    emitter?: EventEmitter2;
    machine: MatcherMachine;
    private state;
    start(): void;
    suspend(): void;
    stop(): void;
    private emitStep;
}
