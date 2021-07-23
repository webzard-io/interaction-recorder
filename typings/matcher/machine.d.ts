import { Interpreter, SingleOrArray, Event as XEvent, SCXML, EventData, StateMachine, State } from 'xstate';
import { MatcherSchema, MatcherEvent, MatcherState, MatcherContext, emitFn } from './types';
export declare class MatcherMachine {
    private _machine;
    private _service;
    private emit;
    private getTargetStateNode;
    get machine(): StateMachine<MatcherContext, MatcherSchema, MatcherEvent, MatcherState>;
    get service(): Interpreter<MatcherContext, MatcherSchema, MatcherEvent, MatcherState>;
    constructor(emit: emitFn);
    send(event: SingleOrArray<XEvent<MatcherEvent>> | SCXML.Event<MatcherEvent>, payload?: EventData | undefined): State<MatcherContext, MatcherEvent, MatcherSchema, MatcherState>;
}
