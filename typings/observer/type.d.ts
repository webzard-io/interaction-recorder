import { BaseBlurEvent, BaseClickEvent, BaseDblClickEvent, BaseDragEvent, BaseKeydownEvent, BaseMousemoveEvent, BaseTextChangeEvent, BaseTextInputEvent, BaseWheelEvent, BaseAuxClickEvent, BaseBeforeUnloadEvent, BaseDragStartEvent, BaseHoverEvent, BaseKeyboardEvent, BaseKeyupEvent, BaseLoadEvent, BaseMousedownEvent, BaseMouseupEvent, BaseScrollEvent, BaseBrowseFileEvent, BaseDragEndEvent, BaseDragEnterEvent, BaseDragLeaveEvent, BaseDragOverEvent, BaseDropEvent, BaseResizeEvent, Modifiers } from '../types';
interface ExtraMouseEventInit {
    screenX: number;
    screenY: number;
    clientX: number;
    clientY: number;
    modifiers: Modifiers;
}
export interface ObserverMousedownEvent extends BaseMousedownEvent, ExtraMouseEventInit {
}
export interface ObserverMouseupEvent extends BaseMouseupEvent, ExtraMouseEventInit {
}
export interface ObserverClickEvent extends BaseClickEvent, ExtraMouseEventInit {
}
export interface ObserverDblClickEvent extends BaseDblClickEvent, ExtraMouseEventInit {
}
export interface ObserverAuxClickEvent extends BaseAuxClickEvent, ExtraMouseEventInit {
}
export declare type ObserverMousemoveEvent = BaseMousemoveEvent;
export declare type ObserverScrollEvent = BaseScrollEvent;
interface ExtraKeyboardEventInit {
    code: string;
    keyCode: number;
    modifiers: Modifiers;
}
export interface ObserverKeydownEvent extends BaseKeydownEvent, ExtraKeyboardEventInit {
}
export interface ObserverKeypressEvent extends BaseKeyboardEvent, ExtraKeyboardEventInit {
}
export interface ObserverKeyupEvent extends BaseKeyupEvent, ExtraKeyboardEventInit {
}
export declare type ObserverTextInputEvent = BaseTextInputEvent;
export declare type ObserverTextChangeEvent = BaseTextChangeEvent;
export declare type ObserverLoadEvent = BaseLoadEvent;
export declare type ObserverBeforeUnloadEvent = BaseBeforeUnloadEvent;
export declare type ObserverBlurEvent = BaseBlurEvent;
export declare type ObserverHoverEvent = BaseHoverEvent;
interface ExtraWheelEventInit {
    deltaMode?: number;
    deltaX?: number;
    deltaY?: number;
    deltaZ?: number;
}
export interface ObserverWheelEvent extends ExtraWheelEventInit, BaseWheelEvent {
}
export interface ObserverDragEvent extends BaseDragEvent, ExtraMouseEventInit {
}
export interface ObserverDragStartEvent extends BaseDragStartEvent<File>, ExtraMouseEventInit {
}
export interface ObserverDragEndEvent extends BaseDragEndEvent, ExtraMouseEventInit {
}
export interface ObserverDragEnterEvent extends BaseDragEnterEvent, ExtraMouseEventInit {
}
export interface ObserverDragOverEvent extends BaseDragOverEvent, ExtraMouseEventInit {
}
export interface ObserverDragLeaveEvent extends BaseDragLeaveEvent, ExtraMouseEventInit {
}
export interface ObserverDropEvent extends BaseDropEvent<File>, ExtraMouseEventInit {
}
export declare type ObserverBrowseFileEvent = BaseBrowseFileEvent<File>;
export declare type ObserverResizeEvent = BaseResizeEvent;
export declare type EventObserverStepEvent = ObserverMousedownEvent | ObserverMouseupEvent | ObserverClickEvent | ObserverAuxClickEvent | ObserverDblClickEvent | ObserverMousemoveEvent | ObserverScrollEvent | ObserverKeydownEvent | ObserverKeypressEvent | ObserverKeyupEvent | ObserverTextInputEvent | ObserverTextChangeEvent | ObserverBlurEvent | ObserverLoadEvent | ObserverBeforeUnloadEvent | ObserverHoverEvent | ObserverWheelEvent | ObserverDragEvent | ObserverDragStartEvent | ObserverDragEndEvent | ObserverDragEnterEvent | ObserverDragOverEvent | ObserverDragLeaveEvent | ObserverDropEvent | ObserverBrowseFileEvent | ObserverResizeEvent;
export {};
