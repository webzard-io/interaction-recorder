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
import { isSpecialKey } from '../util/special-key-map';
import { isInputLikeElement } from './util';
import {
  MatcherSchema,
  MatcherEvent,
  MatcherState,
  MatcherContext,
  emitFn,
  MatcherStep,
  MatcherElement,
} from './types';
import { MachineBeforeUnloadEvent } from '../types';

const dblclickMaxGap = 350;

const isSameTarget = (
  ele1: MatcherElement | null | undefined,
  ele2: MatcherElement | null | undefined,
): boolean => {
  return !!ele1 && !!ele2 && ele1.id === ele2.id;
};

const needRecordTargetIndex = (event: MatcherEvent) => {
  return ['dragend', 'dragenter', 'dragover', 'drop'].includes(event.type);
};

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

  private emit: emitFn;

  private getTargetStateNode(
    state: State<MatcherContext, MatcherEvent, MatcherSchema, MatcherState>,
    event: MatcherEvent,
  ): StateValue {
    const _state = this.machine.resolveState(state!);
    /**
     * FIXME: the _transition function is a private functon.
     * I use this function here is due to assign action in entry cannot get correct state node.
     * when the bug is fixed, make newEvent action not assign type for new step event, and make an entry action to assign the type.
     */
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

  constructor(emit: emitFn) {
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
                target?.tagName === 'window' &&
                currentStep.type !== 'BROWSE_FILE'
              );
            },
            target: 'INIT',
          },
          file: {
            target: 'BROWSE_FILE',
            actions: ['emitStep', 'newStep'],
          },
          hover: {
            target: 'HOVER',
            actions: ['emitStep', 'newStep'],
          },
          dragenter: {
            target: 'DRAG',
            actions: ['emitStep', 'newStep'],
          },
          before_unload: {
            target: 'NAVIGATION',
            actions: ['emitStep', 'newStep'],
          },
          resize: {
            target: 'RESIZE',
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
                      isSameTarget(currentStep.target, target)
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
                      'type' in target.attributes &&
                      target.attributes['type'].toLowerCase() === 'file'
                    );
                  },
                },
                {
                  actions: 'mergeStep',
                },
              ],
              scroll: {
                target: 'SCROLL',
                actions: 'mergeStep',
              },
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
                cond: ({ currentStep }) =>
                  !!currentStep &&
                  !currentStep.events.some(
                    (event) =>
                      event.type === 'mouseup' || event.type === 'dragend',
                  ),
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
              dragend: {
                actions: 'mergeStep',
              },
              drop: {
                actions: 'mergeStep',
              },
            },
          },
          KEYPRESS: {
            on: {
              keydown: {
                actions: 'mergeStep',
                cond: ({ currentStep }) =>
                  // for a key pressing without release the previous one, (mostly used in combination key), treat it as the same step
                  !!currentStep &&
                  currentStep.events.reduce<number>((sum, curr) => {
                    if (curr.type === 'keydown') {
                      return sum + 1;
                    } else if (curr.type === 'keyup') {
                      return sum - 1;
                    }
                    return sum;
                  }, 0) > 0,
              },
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
                    isSpecialKey(event.key) ||
                    !isSameTarget(currentStep?.target, target),
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
                    isSameTarget(currentStep?.target, target),
                },
                {
                  actions: ['emitStep', 'newStep'],
                },
              ],
              text_change: [
                {
                  actions: 'mergeStep',
                  cond: ({ currentStep }, { target }) =>
                    isSameTarget(currentStep?.target, target),
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
          NAVIGATION: {
            on: {
              load: [
                {
                  actions: 'mergeStep',
                  target: 'REFRESH',
                  cond: ({ currentStep }, event) => {
                    return (
                      event.data.url ===
                      (
                        currentStep?.events[
                          currentStep.events.length - 1
                        ] as MachineBeforeUnloadEvent
                      ).url
                    );
                  },
                },
                {
                  actions: 'mergeStep',
                },
              ],
            },
          },
          SCROLL: {
            on: {
              scroll: [
                {
                  actions: 'mergeStep',
                  cond: ({ currentStep }, { target }) =>
                    !isSameTarget(currentStep?.target, target),
                },
                {
                  // ignore non same target scroll event.
                  actions: [],
                },
              ],
              wheel: [
                {
                  actions: ['emitStep', 'newStep'],
                  cond: ({ currentStep }, { target }) =>
                    !isSameTarget(currentStep?.target, target),
                },
                {
                  actions: [],
                },
              ],
              mouseup: {},
              click: {},
            },
          },
          REFRESH: {},
          RESIZE: {},
          HOVER: {},
          UNKNOWN: {},
        },
      },
      {
        actions: {
          emitStep: assign({
            previousStep: (context) => {
              context.currentStep && this.emit('end', context.currentStep);
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
                secondary_target: [],
              };
              this.emit('new', newStep);
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
              /**
               * if need record targetindex
               * and need need record target index
               */
              if ('targetIndex' in event.data && needRecordTargetIndex(event)) {
                if (
                  isSameTarget(
                    newStep.secondary_target[
                      newStep.secondary_target.length - 1
                    ],
                    event.target,
                  )
                ) {
                  // if it share the same target as the last secondary_target, not increasing it;
                  event.data.targetIndex = newStep.secondary_target.length;
                } else {
                  console.log('new index', event);
                  newStep.secondary_target.push(event.target!);
                  event.data.targetIndex = newStep.secondary_target.length + 1;
                }
              }
              newStep.events.push(event.data);

              this.emit('update', newStep);
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
