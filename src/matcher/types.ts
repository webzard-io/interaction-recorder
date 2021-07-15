import { StateSchema } from 'xstate';
import {
  AuxClickEvent,
  BaseBeforeUnloadEvent,
  BaseWheelEvent,
  BlurEvent,
  BrowseFileEvent,
  ClickEvent,
  DblClickEvent,
  DragEndEvent,
  DragEnterEvent,
  DraggingEvent,
  DragLeaveEvent,
  DragOverEvent,
  DragStartEvent,
  DropEvent,
  HoverEvent,
  KeydownEvent,
  KeypressEvent,
  KeyupEvent,
  MousedownEvent,
  MousemoveEvent,
  MouseupEvent,
  ScrollEvent,
  TextChangeEvent,
  TextInputEvent,
} from '../types';
import { MatcherStep } from './matcher';

export interface MatcherContext {
  currentStep?: MatcherStep;
  previousStep?: MatcherStep;
}
/* eslint-disable @typescript-eslint/ban-types */
export interface MatcherSchema extends StateSchema {
  states: {
    INIT: {};
    CLICK: {};
    RIGHT_CLICK: {};
    DBLCLICK: {};
    DRAG: {};
    KEYPRESS: {};
    TEXT: {};
    BROWSE_FILE: {};
    DROP_FILE: {};
    NAVIGATION: {};
    SCROLL: {};
    REFRESH: {};
    RESIZE: {};
    UNKNOWN: {};
  };
}
/* eslint-enable @typescript-eslint/ban-types */
export type MatcherEvent =
  | { type: 'mousedown'; data: MousedownEvent; target: HTMLElement | null }
  | { type: 'mouseup'; data: MouseupEvent; target: HTMLElement | null }
  | { type: 'click'; data: ClickEvent; target: HTMLElement | null }
  | { type: 'dblclick'; data: DblClickEvent; target: HTMLElement | null }
  | { type: 'auxclick'; data: AuxClickEvent; target: HTMLElement | null }
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
      data: BaseBeforeUnloadEvent;
      target: HTMLElement | null;
    }
  | { type: 'hover'; data: HoverEvent; target: HTMLElement | null }
  | { type: 'wheel'; data: BaseWheelEvent; target: HTMLElement | null }
  | { type: 'drag'; data: DraggingEvent; target: HTMLElement | null }
  | { type: 'dragstart'; data: DragStartEvent; target: HTMLElement | null }
  | { type: 'dragend'; data: DragEndEvent; target: HTMLElement | null }
  | { type: 'dragenter'; data: DragEnterEvent; target: HTMLElement | null }
  | { type: 'dragover'; data: DragOverEvent; target: HTMLElement | null }
  | { type: 'dragleave'; data: DragLeaveEvent; target: HTMLElement | null }
  | { type: 'drop'; data: DropEvent; target: HTMLElement | null }
  | { type: 'file'; data: BrowseFileEvent; target: HTMLElement | null };

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
      value: 'RIGHT_CLICK';
      context: MatcherContext;
    }
  | {
      value: 'DBLCLICK';
      context: MatcherContext;
    }
  | {
      value: 'DRAG';
      context: MatcherContext;
    }
  | {
      value: 'KEYPRESS';
      context: MatcherContext;
    }
  | {
      value: 'TEXT';
      context: MatcherContext;
    }
  | {
      value: 'BROWSE_FILE';
      context: MatcherContext;
    }
  | {
      value: 'NAVIGATION';
      context: MatcherContext;
    }
  | {
      value: 'SCROLL';
      context: MatcherContext;
    }
  | {
      value: 'REFRESH';
      context: MatcherContext;
    }
  | {
      value: 'RESIZE';
      context: MatcherContext;
    }
  | {
      value: 'UNKNOWN';
      context: MatcherContext;
    };
