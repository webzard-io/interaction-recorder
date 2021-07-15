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
import { isInputLikeElement, MatcherStep } from '..';
import { isSpecialKey } from '../util/special-key-map';
import {
  MatcherSchema,
  MatcherEvent,
  MatcherState,
  MatcherContext,
} from './types';

const dblclickMaxGap = 350;

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
    state: State<MatcherContext, MatcherEvent, any, any>,
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

  constructor() {
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
              target: 'RIGHT_CLICK',
              actions: ['emitStep', 'newStep'],
              cond: (_c, { data: event }) => event.button === 2,
            },
            {
              target: 'CLICK',
              actions: ['emitStep', 'newStep'],
            },
          ],
          keydown: [
            {
              target: 'TEXT',
              actions: ['emitStep', 'newStep'],
              cond: (_c, { data: event, target }) =>
                !!target &&
                isInputLikeElement(target) &&
                !isSpecialKey(event.key),
            },
            {
              target: 'KEYPRESS',
              actions: ['emitStep', 'newStep'],
              cond: (_c, { target }) => !!target,
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
          drop: {
            target: 'DROP_FILE',
            actions: ['emitStep', 'newStep'],
            cond: (c, event) => !!event.data.items.length,
          },
          wheel: {
            target: 'SCROLL',
            actions: ['emitStep', 'newStep'],
          },
          blur: {
            actions: 'emitStep',
            cond: ({ currentStep }, { target }) => {
              return (
                !!currentStep &&
                target === window &&
                currentStep.type !== 'BROWSE_FILE'
              );
            },
          },
          file: {
            target: 'BROWSE_FILE',
            actions: ['emitStep', 'newStep'],
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
                  target: 'DBLCLICK',
                  cond: ({ currentStep }, { data: event, target }) => {
                    if (!currentStep) {
                      return false;
                    }
                    const lastEvent =
                      currentStep.events[currentStep.events.length - 1];
                    return (
                      lastEvent.type === 'click' &&
                      event.button === lastEvent.button &&
                      event.timestamp - lastEvent.timestamp <= dblclickMaxGap &&
                      currentStep.target === target
                    );
                  },
                  actions: 'mergeStep',
                },
                {
                  cond: ({ currentStep }) => {
                    if (!currentStep) {
                      return false;
                    }
                    return (
                      currentStep.type === 'CLICK' &&
                      currentStep.events.filter(
                        (event) => event.type === 'mousedown',
                      ).length ===
                        currentStep.events.filter(
                          (event) => event.type === 'mouseup',
                        ).length +
                          1
                    );
                  },
                  actions: 'mergeStep',
                },
                {
                  target: 'RIGHT_CLICK',
                  actions: ['emitStep', 'newStep'],
                  cond: (_c, { data: event }) => event.button === 2,
                },
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
              auxclick: {
                actions: 'mergeStep',
              },
              click: [
                {
                  target: 'BROWSE_FILE',
                  actions: 'mergeStep',
                  cond: (_c, { target }) => {
                    return (
                      target?.tagName === 'INPUT' &&
                      (target as HTMLInputElement).type === 'file'
                    );
                  },
                },
                {
                  actions: 'mergeStep',
                },
              ],
            },
          },
          RIGHT_CLICK: {
            on: {
              mouseup: {
                actions: 'mergeStep',
              },
              auxclick: {
                actions: 'mergeStep',
              },
            },
          },
          DBLCLICK: {
            on: {
              mouseup: {
                actions: 'mergeStep',
              },
              click: {
                actions: 'mergeStep',
              },
              dblclick: {
                actions: 'mergeStep',
              },
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
              drag: {
                actions: 'mergeStep',
              },
              dragstart: {
                actions: 'mergeStep',
              },
              dragenter: {
                actions: 'mergeStep',
              },
              dragleave: {
                actions: 'mergeStep',
              },
              dragover: {
                actions: 'mergeStep',
              },
              drop: {
                actions: 'mergeStep',
              },
            },
          },
          KEYPRESS: {
            on: {
              keydown: [
                {
                  actions: 'mergeStep',
                  cond: ({ currentStep }) =>
                    !!currentStep &&
                    currentStep.events.filter(
                      (event) => event.type === 'keydown',
                    ) >
                      currentStep.events.filter(
                        (event) => event.type === 'keyup',
                      ),
                },
                {
                  actions: ['emitStep', 'newStep'],
                },
              ],
              keypress: {
                actions: 'mergeStep',
              },
              keyup: {
                actions: 'mergeStep',
              },
            },
          },
          TEXT: {
            on: {
              keydown: [
                {
                  target: 'KEYPRESS',
                  actions: ['emitStep', 'newStep'],
                  cond: ({ currentStep }, { data: event, target }) =>
                    isSpecialKey(event.key) || currentStep?.target !== target,
                },
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
          BROWSE_FILE: {
            on: {
              file: {
                target: 'BROWSE_FILE',
                actions: 'mergeStep',
              },
            },
          },
          DROP_FILE: {},
          NAVIGATION: {},
          SCROLL: {
            on: {
              scroll: {
                actions: 'mergeStep',
              },
            },
          },
          REFRESH: {},
          RESIZE: {},
          UNKNOWN: {},
        },
      },
      {
        actions: {
          emitStep: assign({
            previousStep: (context) => {
              console.log('emit', context.currentStep);
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
    (window as any)['__service__'] = this._service;
  }

  public send(
    event: SingleOrArray<XEvent<MatcherEvent>> | SCXML.Event<MatcherEvent>,
    payload?: EventData | undefined,
  ) {
    return this._service.send(event, payload);
  }
}

// const machine = new MatcherMachine();
// machine.withConfig({});
