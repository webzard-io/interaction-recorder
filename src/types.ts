import { IMeta } from './util/metaquerier';

export enum MatcherKey {
  NEW_EVENT = 'matcher.newEvent',
  EMIT = 'matchere.emit',
}

export type Step = {
  selector: IMeta;
  type: 'CLICK' | 'DRAG' | 'TEXT' | 'SCROLL' | 'UNKNOWN';
  events: StepEvent[];
};

export type StepEvent =
  | MouseEvents
  | ScrollEvent
  | KeydownEvent
  | KeypressEvent
  | TextInputEvent
  | TextChangeEvent
  | KeyupEvent
  | BlurEvent
  | MachineBeforeUnloadEvent
  | HoverEvent
  | MachineWheelEvent;

export type Modifiers = {
  // only record modifers when needed
  ctrlKey?: true;
  altKey?: true;
  shiftKey?: true;
  metaKey?: true;
};

export type MousemoveRecord = {
  clientX: number;
  clientY: number;
  screenX: number;
  screenY: number;
  timeOffset: number;
};

type BaseEvent = {
  timestamp: number;
};
//#region mouse event
export type MachineMouseEvent = BaseEvent & {
  // we need to collect mouseEventInit;
  screenX: number;
  screenY: number;
  clientX: number;
  clientY: number;
  button: number;
  buttons: number;
  modifiers: Modifiers;
};

export type MousedownEvent = MachineMouseEvent & {
  type: 'mousedown';
};

export type MouseupEvent = MachineMouseEvent & {
  type: 'mouseup';
};

export type ClickEvent = MachineMouseEvent & {
  type: 'click';
};

// mousemove is special
export type MousemoveEvent = BaseEvent & {
  type: 'mousemove';
  positions: Array<MousemoveRecord>;
};

type MouseEvents = MousedownEvent | MouseupEvent | ClickEvent | MousemoveEvent;
//#endregion mouse event

export type ScrollEvent = BaseEvent & {
  type: 'scroll';
  scrollLeft: number;
  scrollTop: number;
};

//#region keyboard event
export type MachineKeyboardEvent = BaseEvent & {
  key: string;
  code: string;
  keyCode: number;
  modifiers: Modifiers;
};

export type KeydownEvent = MachineKeyboardEvent & {
  type: 'keydown';
};

export type KeypressEvent = MachineKeyboardEvent & {
  type: 'keypress';
};

export type KeyupEvent = MachineKeyboardEvent & {
  type: 'keyup';
};
//#endregion keyboard event

//#region textinput
export type TextInputEvent = BaseEvent & {
  type: 'text_input';
  data: string;
  // departed
  value: string;
};

export type TextChangeEvent = BaseEvent & {
  type: 'text_change';
  value: string;
};
//#region textinput
export type BlurEvent = BaseEvent & {
  type: 'blur';
};

export type MachineBeforeUnloadEvent = BaseEvent & {
  type: 'before_unload';
};

export type HoverEvent = BaseEvent & {
  type: 'hover';
  clientX: number;
  clientY: number;
};

export type MachineWheelEvent = BaseEvent & {
  type: 'wheel';
};
