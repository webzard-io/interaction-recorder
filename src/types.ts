import { IDataTransferItem } from './util/entry-reader';
import { IMeta } from './util/metaquerier';

export enum MatcherKey {
  NEW_EVENT = 'matcher.newEvent',
  EMIT = 'matchere.emit',
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
  | BaseBeforeUnloadEvent
  | HoverEvent
  | BaseWheelEvent
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
export type BaseMouseEvent = BaseEvent & {
  // we need to collect mouseEventInit;
  screenX: number;
  screenY: number;
  clientX: number;
  clientY: number;
  button: number;
  buttons: number;
  modifiers: Modifiers;
};

export type MousedownEvent = BaseMouseEvent & {
  type: 'mousedown';
};

export type MouseupEvent = BaseMouseEvent & {
  type: 'mouseup';
};

export type ClickEvent = BaseMouseEvent & {
  type: 'click';
};

export type DblClickEvent = BaseMouseEvent & {
  type: 'dblclick';
};

export type AuxClickEvent = BaseMouseEvent & {
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
export type BaseKeyboardEvent = BaseEvent & {
  key: string;
  code: string;
  keyCode: number;
  modifiers: Modifiers;
};

export type KeydownEvent = BaseKeyboardEvent & {
  type: 'keydown';
};

export type KeypressEvent = BaseKeyboardEvent & {
  type: 'keypress';
};

export type KeyupEvent = BaseKeyboardEvent & {
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

export type BaseBeforeUnloadEvent = BaseEvent & {
  type: 'before_unload';
};

export type HoverEvent = BaseEvent & {
  type: 'hover';
  clientX: number;
  clientY: number;
};

export type BaseWheelEvent = BaseEvent & {
  type: 'wheel';
};

export type BaseDragEvent = BaseMouseEvent & {
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
