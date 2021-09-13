import { IMeta } from './util/metaquerier';
import { IDataTransferItem } from './util/entry-reader';
export declare enum MatcherKey {
    RECEIVE_NEW_EVENT = "matcher.browser_event.new",
    EMIT_NEW_STEP = "matcher.step_event.new",
    EMIT_UPDATE_STEP = "matcher.step_event.update",
    EMIT_END_STEP = "matcher.step_event.end"
}
export declare type Step = {
    selector: IMeta;
    type: 'CLICK' | 'RIGHT_CLICK' | 'DBLCLICK' | 'DRAG' | 'KEYPRESS' | 'TEXT' | 'BROWSE_FILE' | 'DROP_FILE' | 'NAVIGATION' | 'SCROLL' | 'REFRESH' | 'RESIZE' | 'HOVER' | 'UNKNOWN';
    events: StepEvent[];
};
export declare type StepEvent = MouseEvents | ScrollEvent | KeydownEvent | KeypressEvent | TextInputEvent | TextChangeEvent | KeyupEvent | BlurEvent | MachineBeforeUnloadEvent | HoverEvent | MachineWheelEvent | DraggingEvent | DropEvent | DragStartEvent | DragEndEvent | DragEnterEvent | DragOverEvent | DragLeaveEvent | BrowseFileEvent;
export declare type Modifiers = {
    ctrlKey?: true;
    altKey?: true;
    shiftKey?: true;
    metaKey?: true;
};
export declare type MousemoveRecord = {
    clientX: number;
    clientY: number;
    screenX: number;
    screenY: number;
    timeOffset: number;
};
declare type BaseEvent = {
    timestamp: number;
};
export declare type MachineMouseEvent = BaseEvent & {
    screenX: number;
    screenY: number;
    clientX: number;
    clientY: number;
    button: number;
    buttons: number;
    modifiers: Modifiers;
};
export declare type MousedownEvent = MachineMouseEvent & {
    type: 'mousedown';
};
export declare type MouseupEvent = MachineMouseEvent & {
    type: 'mouseup';
};
export declare type ClickEvent = MachineMouseEvent & {
    type: 'click';
};
export declare type DblClickEvent = MachineMouseEvent & {
    type: 'dblclick';
};
export declare type AuxClickEvent = MachineMouseEvent & {
    type: 'auxclick';
};
export declare type MousemoveEvent = BaseEvent & {
    type: 'mousemove';
    positions: Array<MousemoveRecord>;
};
declare type MouseEvents = MousedownEvent | MouseupEvent | ClickEvent | DblClickEvent | AuxClickEvent | MousemoveEvent;
export declare type ScrollEvent = BaseEvent & {
    type: 'scroll';
    scrollLeft: number;
    scrollTop: number;
};
export declare type MachineKeyboardEvent = BaseEvent & {
    key: string;
    code: string;
    keyCode: number;
    modifiers: Modifiers;
};
export declare type KeydownEvent = MachineKeyboardEvent & {
    type: 'keydown';
};
export declare type KeypressEvent = MachineKeyboardEvent & {
    type: 'keypress';
};
export declare type KeyupEvent = MachineKeyboardEvent & {
    type: 'keyup';
};
export declare type TextInputEvent = BaseEvent & {
    type: 'text_input';
    data: string;
    value: string;
};
export declare type TextChangeEvent = BaseEvent & {
    type: 'text_change';
    value: string;
};
export declare type BlurEvent = BaseEvent & {
    type: 'blur';
};
export declare type MachineBeforeUnloadEvent = BaseEvent & {
    type: 'before_unload';
};
export declare type HoverEvent = BaseEvent & {
    type: 'hover';
    clientX: number;
    clientY: number;
};
export declare type MachineWheelEvent = BaseEvent & {
    type: 'wheel';
};
export declare type MachineDragEvent = MachineMouseEvent & {
    targetIndex: number;
};
export declare type DraggingEvent = MachineDragEvent & {
    type: 'drag';
};
export declare type DragStartEvent = MachineDragEvent & {
    type: 'dragstart';
    effectAllowed: DataTransfer['effectAllowed'];
    items: Array<IDataTransferItem | undefined>;
};
export declare type DragEndEvent = MachineDragEvent & {
    type: 'dragend';
};
export declare type DragEnterEvent = MachineDragEvent & {
    type: 'dragenter';
};
export declare type DragOverEvent = MachineDragEvent & {
    type: 'dragover';
    dropEffect: DataTransfer['dropEffect'];
};
export declare type DragLeaveEvent = MachineDragEvent & {
    type: 'dragleave';
};
export declare type DropEvent = MachineDragEvent & {
    type: 'drop';
    effectAllowed: DataTransfer['effectAllowed'];
    dropEffect: DataTransfer['dropEffect'];
    items: Array<IDataTransferItem | undefined>;
};
export declare type BrowseFileEvent = BaseEvent & {
    type: 'file';
    files: Array<File>;
};
export {};
