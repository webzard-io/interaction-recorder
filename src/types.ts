import { IMeta } from './util/metaquerier';
import { IDataTransferItem } from './util/entry-reader';

export enum MatcherKey {
  RECEIVE_NEW_EVENT = 'matcher.browser_event.new',
  EMIT_NEW_STEP = 'matcher.step_event.new',
  EMIT_UPDATE_STEP = 'matcher.step_event.update',
  EMIT_END_STEP = 'matcher.step_event.end',
}

export type Step = {
  selector: IMeta;
  type:
    | 'CLICK'
    | 'RIGHT_CLICK'
    | 'DBLCLICK'
    | 'DRAG'
    | 'KEYPRESS'
    | 'TEXT'
    | 'BROWSE_FILE'
    | 'DROP_FILE'
    | 'NAVIGATION'
    | 'SCROLL'
    | 'REFRESH'
    | 'RESIZE'
    | 'UNKNOWN';
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
  | MachineWheelEvent
  | DraggingEvent
  | DropEvent
  | DragStartEvent
  | DragEndEvent
  | DragEnterEvent
  | DragOverEvent
  | DragLeaveEvent
  | BrowseFileEvent;

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

export type DblClickEvent = MachineMouseEvent & {
  type: 'dblclick';
};

export type AuxClickEvent = MachineMouseEvent & {
  type: 'auxclick';
};

// mousemove is special
export type MousemoveEvent = BaseEvent & {
  type: 'mousemove';
  positions: Array<MousemoveRecord>;
};

type MouseEvents =
  | MousedownEvent
  | MouseupEvent
  | ClickEvent
  | DblClickEvent
  | AuxClickEvent
  | MousemoveEvent;
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

export type BaseDragEvent = MachineMouseEvent & {
  targetIndex: number;
};

export type DraggingEvent = BaseDragEvent & {
  type: 'drag';
};
export type DragStartEvent = BaseDragEvent & {
  type: 'dragstart';
  effectAllowed: DataTransfer['effectAllowed'];
  items: Array<IDataTransferItem | undefined>;
};
export type DragEndEvent = BaseDragEvent & {
  type: 'dragend';
};
export type DragEnterEvent = BaseDragEvent & {
  type: 'dragenter';
};
export type DragOverEvent = BaseDragEvent & {
  type: 'dragover';
  dropEffect: DataTransfer['dropEffect'];
};
export type DragLeaveEvent = BaseDragEvent & {
  type: 'dragleave';
};
export type DropEvent = BaseDragEvent & {
  type: 'drop';
  effectAllowed: DataTransfer['effectAllowed'];
  dropEffect: DataTransfer['dropEffect'];
  items: Array<IDataTransferItem | undefined>;
};

export type BrowseFileEvent = BaseEvent & {
  type: 'file';
  files: Array<File>;
};
