import { Interpreter, SingleOrArray, Event as XEvent, SCXML, EventData, StateMachine, State } from 'xstate';
import { MatcherSchema, MatcherEvent, MatcherState, MatcherContext, emitFn } from './types';
import { BaseStepEvent } from '../types';
export declare class MatcherMachine<TStepEvent extends BaseStepEvent = BaseStepEvent> {
    private _machine;
    private _service;
    private emit;
    private getTargetStateNode;
    get machine(): StateMachine<MatcherContext<TStepEvent>, MatcherSchema, MatcherEvent, MatcherState<TStepEvent>>;
    get service(): Interpreter<MatcherContext<TStepEvent>, MatcherSchema, MatcherEvent, MatcherState<TStepEvent>>;
    constructor(emit: emitFn<TStepEvent>);
    send(event: SingleOrArray<XEvent<MatcherEvent>> | SCXML.Event<MatcherEvent>, payload?: EventData | undefined): State<MatcherContext<TStepEvent>, MatcherEvent, MatcherSchema, MatcherState<TStepEvent>>;
}
