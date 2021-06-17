import { IMeta } from './util/metaquerier';

export type Step = {
  selector: IMeta;
  action: 'CLICK' | 'DRAG' | 'SCROLL' | 'TEXT';
  events: StepEvent[];
};

export type StepEvent =
  | MousedownEvent
  | MouseupEvent
  | ClickEvent
  | MousemoveEvent
  | ScrollEvent
  | KeydownEvent
  | KeypressEvent
  | TextInputEvent
  | KeyupEvent
  | BlurEvent;

export type Modifiers = {
  // only record modifers when needed
  ctrl?: true;
  alt?: true;
  shift?: true;
  meta?: true;
};

export type MousemoveRecord = {
  clientX: number;
  clientY: number;
  timeOffset: number;
};

type BaseEvent = {
  timestamp: number;
};

export type MousedownEvent = BaseEvent & {
  type: 'MOUSEDOWN';
  clientX: number;
  clientY: number;
  modifiers: Modifiers;
};

export type MouseupEvent = BaseEvent & {
  type: 'MOUSEUP';
  clientX: number;
  clientY: number;
  modifiers: Modifiers;
};

export type ClickEvent = BaseEvent & {
  type: 'CLICK';
  clientX: number;
  clientY: number;
  modifiers: Modifiers;
};

export type MousemoveEvent = BaseEvent & {
  type: 'MOUSEMOVE';
  positions: Array<MousemoveRecord>;
};

export type ScrollEvent = BaseEvent & {
  type: 'SCROLL';
  scrollLeft: number;
  scrollTop: number;
};

export type KeydownEvent = BaseEvent & {
  type: 'KEYDOWN';
  key: string;
  modifiers: Modifiers;
};

export type KeypressEvent = BaseEvent & {
  type: 'KEYPRESS';
  key: string;
  modifiers: Modifiers;
};

export type TextInputEvent = BaseEvent & {
  type: 'TEXT_INPUT';
  data: string;
  value: string;
};

export type KeyupEvent = BaseEvent & {
  type: 'KEYUP';
  key: string;
  keyCode: number;
  modifiers: Modifiers;
};

export type BlurEvent = BaseEvent & {
  type: 'BLUR';
};
