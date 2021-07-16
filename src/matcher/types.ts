import { StateSchema } from 'xstate';
import {
  BlurEvent,
  ClickEvent,
  HoverEvent,
  KeydownEvent,
  KeypressEvent,
  KeyupEvent,
  MachineBeforeUnloadEvent,
  MachineWheelEvent,
  MousedownEvent,
  MousemoveEvent,
  MouseupEvent,
  ScrollEvent,
  TextChangeEvent,
  TextInputEvent,
} from '../types';
import { MatcherStep } from './index';

export interface MatcherContext {
  currentStep?: MatcherStep;
  previousStep?: MatcherStep;
}
/* eslint-disable @typescript-eslint/ban-types */
export interface MatcherSchema extends StateSchema {
  states: {
    INIT: {};
    CLICK: {};
    DRAG: {};
    TEXT: {};
    SCROLL: {};
    UNKNOWN: {};
  };
}
/* eslint-enable @typescript-eslint/ban-types */
export type MatcherEvent =
  | { type: 'mousedown'; data: MousedownEvent; target: HTMLElement | null }
  | { type: 'mouseup'; data: MouseupEvent; target: HTMLElement | null }
  | { type: 'click'; data: ClickEvent; target: HTMLElement | null }
  | { type: 'mousemove'; data: MousemoveEvent; target: HTMLElement | null }
  | { type: 'scroll'; data: ScrollEvent; target: HTMLElement | null }
  | { type: 'keydown'; data: KeydownEvent; target: HTMLElement | null }
  | { type: 'keypress'; data: KeypressEvent; target: HTMLElement | null }
  | { type: 'keyup'; data: KeyupEvent; target: HTMLElement | null }
  | { type: 'text_input'; data: TextInputEvent; target: HTMLElement | null }
  | { type: 'text_change'; data: TextChangeEvent; target: HTMLElement | null }
  | { type: 'blur'; data: BlurEvent; target: HTMLElement | null }
  | {
      type: 'before_unload';
      data: MachineBeforeUnloadEvent;
      target: HTMLElement | null;
    }
  | { type: 'hover'; data: HoverEvent; target: HTMLElement | null }
  | { type: 'wheel'; data: MachineWheelEvent; target: HTMLElement | null };

export type MatcherState =
  | {
      value: 'INIT';
      context: MatcherContext;
    }
  | {
      value: 'CLICK';
      context: MatcherContext;
    }
  | {
      value: 'DRAG';
      context: MatcherContext;
    }
  | {
      value: 'TEXT';
      context: MatcherContext;
    }
  | {
      value: 'SCROLL';
      context: MatcherContext;
    }
  | {
      value: 'UNKNOWN';
      context: MatcherContext;
    };
