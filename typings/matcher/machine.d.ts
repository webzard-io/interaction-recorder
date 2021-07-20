import { Interpreter, SingleOrArray, Event as XEvent, SCXML, EventData, StateMachine, State } from 'xstate';
import { MatcherStep } from './index';
import { MatcherSchema, MatcherEvent, MatcherState, MatcherContext } from './types';
export declare class MatcherMachine {
    private _machine;
    private _service;
    private emit;
    private getTargetStateNode;
    get machine(): StateMachine<MatcherContext, MatcherSchema, MatcherEvent, MatcherState>;
    get service(): Interpreter<MatcherContext, MatcherSchema, MatcherEvent, MatcherState>;
    constructor(emit: (step: MatcherStep) => void);
    send(event: SingleOrArray<XEvent<MatcherEvent>> | SCXML.Event<MatcherEvent>, payload?: EventData | undefined): State<MatcherContext, MatcherEvent, MatcherSchema, MatcherState>;
}
