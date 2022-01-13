import { IMeta } from './util/metaquerier';
import { IDataTransferItem } from './util/entry-reader';
export declare enum MatcherKey {
    RECEIVE_NEW_EVENT = "matcher.browser_event.new",
    EMIT_NEW_STEP = "matcher.step_event.new",
    EMIT_UPDATE_STEP = "matcher.step_event.update",
    EMIT_END_STEP = "matcher.step_event.end"
}
export declare type Step<TEvent extends BaseStepEvent> = {
    selector: IMeta;
    type: 'CLICK' | 'RIGHT_CLICK' | 'DBLCLICK' | 'DRAG' | 'KEYPRESS' | 'TEXT' | 'BROWSE_FILE' | 'DROP_FILE' | 'NAVIGATION' | 'SCROLL' | 'REFRESH' | 'RESIZE' | 'HOVER' | 'UNKNOWN';
    events: TEvent[];
};
export declare type BaseStepEvent = BaseMousedownEvent | BaseMouseupEvent | BaseClickEvent | BaseAuxClickEvent | BaseDblClickEvent | BaseMousemoveEvent | BaseScrollEvent | BaseKeydownEvent | BaseKeypressEvent | BaseKeyupEvent | BaseTextInputEvent | BaseTextChangeEvent | BaseBlurEvent | BaseLoadEvent | BaseBeforeUnloadEvent | BaseHoverEvent | BaseWheelEvent | BaseDragEvent | BaseDropEvent<unknown> | BaseDragStartEvent<unknown> | BaseDragEndEvent | BaseDragEnterEvent | BaseDragOverEvent | BaseDragLeaveEvent | BaseBrowseFileEvent<unknown> | BaseResizeEvent;
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
interface BaseEvent {
    type: 'mousedown' | 'mouseup' | 'mousemove' | 'click' | 'dblclick' | 'auxclick' | 'scroll' | 'keydown' | 'keypress' | 'keyup' | 'text_input' | 'text_change' | 'load' | 'before_unload' | 'blur' | 'hover' | 'wheel' | 'drag' | 'dragstart' | 'dragend' | 'dragenter' | 'dragover' | 'dragleave' | 'drop' | 'file' | 'resize';
    timestamp: number;
}
export interface BaseMouseEvent extends BaseEvent {
    type: 'mousedown' | 'mouseup' | 'click' | 'dblclick' | 'auxclick' | 'drag' | 'drop' | 'dragstart' | 'dragend' | 'dragenter' | 'dragover' | 'dragleave';
    button: number;
    buttons: number;
    clientX: number;
    clientY: number;
}
export interface BaseMousedownEvent extends BaseMouseEvent {
    type: 'mousedown';
}
export interface BaseMouseupEvent extends BaseMouseEvent {
    type: 'mouseup';
}
export interface BaseClickEvent extends BaseMouseEvent {
    type: 'click';
}
export interface BaseDblClickEvent extends BaseMouseEvent {
    type: 'dblclick';
}
export interface BaseAuxClickEvent extends BaseMouseEvent {
    type: 'auxclick';
}
export interface BaseMousemoveEvent extends BaseEvent {
    type: 'mousemove';
    positions: Array<MousemoveRecord>;
}
export interface BaseScrollEvent extends BaseEvent {
    type: 'scroll';
    scrollLeft: number;
    scrollTop: number;
}
export interface BaseKeyboardEvent extends BaseEvent {
    type: 'keydown' | 'keypress' | 'keyup';
    key: string;
}
export interface BaseKeydownEvent extends BaseKeyboardEvent {
    type: 'keydown';
}
export interface BaseKeypressEvent extends BaseKeyboardEvent {
    type: 'keypress';
}
export interface BaseKeyupEvent extends BaseKeyboardEvent {
    type: 'keyup';
}
export interface BaseTextInputEvent extends BaseEvent {
    type: 'text_input';
    data: string;
    value: string;
}
export interface BaseTextChangeEvent extends BaseEvent {
    type: 'text_change';
    value: string;
}
export interface BaseLoadEvent extends BaseEvent {
    type: 'load';
    url: string;
}
export interface BaseBeforeUnloadEvent extends BaseEvent {
    type: 'before_unload';
    url: string;
}
export interface BaseBlurEvent extends BaseEvent {
    type: 'blur';
}
export interface BaseHoverEvent extends BaseEvent {
    type: 'hover';
    clientX: number;
    clientY: number;
}
export interface BaseWheelEvent extends BaseEvent {
    type: 'wheel';
}
export interface BaseDraggingEvent extends BaseMouseEvent {
    type: 'drag' | 'dragstart' | 'dragend' | 'dragenter' | 'dragover' | 'dragleave' | 'drop';
    targetIndex: number;
}
export interface BaseDragEvent extends BaseDraggingEvent {
    type: 'drag';
}
export interface BaseDragStartEvent<TFile> extends BaseDraggingEvent {
    type: 'dragstart';
    effectAllowed: DataTransfer['effectAllowed'];
    items: Array<IDataTransferItem<TFile> | undefined>;
}
export interface BaseDragEndEvent extends BaseDraggingEvent {
    type: 'dragend';
}
export interface BaseDragEnterEvent extends BaseDraggingEvent {
    type: 'dragenter';
}
export interface BaseDragOverEvent extends BaseDraggingEvent {
    type: 'dragover';
    dropEffect: DataTransfer['dropEffect'];
}
export interface BaseDragLeaveEvent extends BaseDraggingEvent {
    type: 'dragleave';
}
export interface BaseDropEvent<TFile> extends BaseDraggingEvent {
    type: 'drop';
    effectAllowed: DataTransfer['effectAllowed'];
    dropEffect: DataTransfer['dropEffect'];
    items: Array<IDataTransferItem<TFile> | undefined>;
}
export interface BaseBrowseFileEvent<TFile> extends BaseEvent {
    type: 'file';
    files: Array<TFile>;
}
export interface BaseResizeEvent extends BaseEvent {
    type: 'resize';
    x: number;
    y: number;
}
export {};
