import {
  interpret,
  Interpreter,
  SingleOrArray,
  Event as XEvent,
  SCXML,
  EventData,
  StateMachine,
  assign,
  Machine,
  State,
  StateValue,
} from 'xstate';
import { toSCXMLEvent } from 'xstate/lib/utils';
import { MatcherStep } from '..';
import {
  MatcherSchema,
  MatcherEvent,
  MatcherState,
  MatcherContext,
} from './types';

export class MatcherMachine {
  private _machine: StateMachine<
    MatcherContext,
    MatcherSchema,
    MatcherEvent,
    MatcherState
  >;
  private _service: Interpreter<
    MatcherContext,
    MatcherSchema,
    MatcherEvent,
    MatcherState
  >;

  private getTargetStateNode(
    state: State<MatcherContext, MatcherEvent, MatcherSchema, MatcherState>,
    event: MatcherEvent,
  ): StateValue {
    const _state = this.machine.resolveState(state!);
    const transitions = this.machine['_transition'](
      _state.value,
      _state,
      toSCXMLEvent(event),
    ).transitions;
    const transition = transitions[transitions.length - 1];
    // if it has no target, use current state;
    return transition.target ? transition.target[0].key : state!.value;
  }

  public get machine() {
    return this._machine;
  }

  public get service() {
    return this._service;
  }

  private emit: (step: MatcherStep) => void;

  constructor(emit: (step: MatcherStep) => void) {
    this.emit = emit;
    this._machine = Machine<MatcherContext, MatcherSchema, MatcherEvent>(
      {
        id: 'matcher',
        initial: 'INIT',
        context: {
          currentStep: undefined,
          previousStep: undefined,
        },
        on: {
          mousedown: [
            {
              target: 'CLICK',
              actions: ['emitStep', 'newStep'],
            },
          ],
          keydown: [
            {
              target: 'TEXT',
              actions: ['emitStep', 'newStep'],
            },
          ],
          text_input: {
            target: 'TEXT',
            actions: ['emitStep', 'newStep'],
          },
          text_change: {
            target: 'TEXT',
            actions: ['emitStep', 'newStep'],
          },
          wheel: {
            target: 'SCROLL',
            actions: ['emitStep', 'newStep'],
          },
          blur: {
            actions: 'emitStep',
            cond: ({ currentStep }, { target }) => {
              return !!currentStep && target === window;
            },
          },
          '*': {
            target: 'UNKNOWN',
            actions: ['emitStep', 'newStep'],
            cond: (c, event) =>
              !['mousemove', 'blur', 'keyup'].includes(event.type),
          },
        },
        states: {
          INIT: {},
          CLICK: {
            on: {
              mousedown: [
                {
                  actions: ['emitStep', 'newStep'],
                },
              ],
              mousemove: {
                target: 'DRAG',
                actions: 'mergeStep',
                cond: ({ currentStep }, { data: event }) => {
                  if (!currentStep) {
                    return false;
                  }
                  const lastEvent =
                    currentStep.events[currentStep.events.length - 1];
                  const firstEvent = currentStep.events[0];

                  return (
                    firstEvent.type === 'mousedown' &&
                    currentStep.events
                      .slice(1)
                      .every((event) => event.type === 'mousemove') &&
                    !(
                      lastEvent.type === 'mousedown' &&
                      event.positions.length === 1 &&
                      event.positions[0].clientX === lastEvent.clientX &&
                      event.positions[0].clientY === lastEvent.clientY
                    )
                  );
                },
              },
              mouseup: {
                actions: 'mergeStep',
              },
              click: [
                {
                  actions: 'mergeStep',
                },
              ],
            },
          },
          DRAG: {
            on: {
              mousemove: {
                actions: 'mergeStep',
              },
              mouseup: {
                actions: 'mergeStep',
              },
              click: {
                actions: 'mergeStep',
              },
            },
          },
          TEXT: {
            on: {
              keydown: [
                {
                  actions: 'mergeStep',
                },
              ],
              keypress: {
                actions: 'mergeStep',
              },
              keyup: {
                actions: 'mergeStep',
              },
              text_input: [
                {
                  actions: 'mergeStep',
                  cond: ({ currentStep }, { target }) =>
                    currentStep?.target === target,
                },
                {
                  actions: ['emitStep', 'newStep'],
                },
              ],
              text_change: [
                {
                  actions: 'mergeStep',
                  cond: ({ currentStep }, { target }) =>
                    currentStep?.target === target,
                },
                {
                  actions: ['emitStep', 'newStep'],
                },
              ],
            },
          },
          SCROLL: {
            on: {
              scroll: {
                actions: 'mergeStep',
              },
            },
          },
          UNKNOWN: {},
        },
      },
      {
        actions: {
          emitStep: assign({
            previousStep: (context) => {
              context.currentStep && this.emit(context.currentStep);
              return context.currentStep;
            },
            currentStep: (_c) => undefined,
          }),
          newStep: assign({
            currentStep: (context, event, { state }) => {
              if (!state) {
                return context.currentStep;
              }
              const newStep: MatcherStep = {
                target: event.target,
                type: this.getTargetStateNode(
                  state,
                  event,
                ) as MatcherStep['type'],
                events: [event.data],
              };
              return newStep;
            },
          }),
          mergeStep: assign({
            currentStep: (context, event, { state }) => {
              if (!context.currentStep || !state) {
                return context.currentStep;
              }
              const newStep = {
                ...context.currentStep,
                type: this.getTargetStateNode(
                  state,
                  event,
                ) as MatcherStep['type'],
              };
              newStep.events.push(event.data);
              return newStep;
            },
          }),
        },
        guards: {},
      },
    );
    this._service = interpret(this._machine, {
      deferEvents: false,
    });
    this._service.start();
  }

  public send(
    event: SingleOrArray<XEvent<MatcherEvent>> | SCXML.Event<MatcherEvent>,
    payload?: EventData | undefined,
  ) {
    return this._service.send(event, payload);
  }
}
