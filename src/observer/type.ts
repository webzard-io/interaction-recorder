import { EventEmitter2 } from 'eventemitter2';
import {
  BaseBlurEvent,
  BaseClickEvent,
  BaseDblClickEvent,
  BaseDragEvent,
  BaseKeydownEvent,
  BaseMousemoveEvent,
  BaseTextChangeEvent,
  BaseTextInputEvent,
  BaseWheelEvent,
  BaseAuxClickEvent,
  BaseBeforeUnloadEvent,
  BaseDragStartEvent,
  BaseHoverEvent,
  BaseKeyboardEvent,
  BaseKeyupEvent,
  BaseLoadEvent,
  BaseMousedownEvent,
  BaseMouseupEvent,
  BaseScrollEvent,
  BaseBrowseFileEvent,
  BaseDragEndEvent,
  BaseDragEnterEvent,
  BaseDragLeaveEvent,
  BaseDragOverEvent,
  BaseDropEvent,
  BaseResizeEvent,
  Modifiers,
} from '../types';

// extra mouse event init pick by observer
interface ExtraMouseEventInit {
  screenX: number;
  screenY: number;
  clientX: number;
  clientY: number;
  modifiers: Modifiers;
}

export interface ObserverMousedownEvent
  extends BaseMousedownEvent,
    ExtraMouseEventInit {}

export interface ObserverMouseupEvent
  extends BaseMouseupEvent,
    ExtraMouseEventInit {}

export interface ObserverClickEvent
  extends BaseClickEvent,
    ExtraMouseEventInit {}

export interface ObserverDblClickEvent
  extends BaseDblClickEvent,
    ExtraMouseEventInit {}

export interface ObserverAuxClickEvent
  extends BaseAuxClickEvent,
    ExtraMouseEventInit {}

export type ObserverMousemoveEvent = BaseMousemoveEvent;
export type ObserverScrollEvent = BaseScrollEvent;

interface ExtraKeyboardEventInit {
  code: string;
  keyCode: number;
  modifiers: Modifiers;
}

export interface ObserverKeydownEvent
  extends BaseKeydownEvent,
    ExtraKeyboardEventInit {}

export interface ObserverKeypressEvent
  extends BaseKeyboardEvent,
    ExtraKeyboardEventInit {}

export interface ObserverKeyupEvent
  extends BaseKeyupEvent,
    ExtraKeyboardEventInit {}

export type ObserverTextInputEvent = BaseTextInputEvent;
export type ObserverTextChangeEvent = BaseTextChangeEvent;
export type ObserverLoadEvent = BaseLoadEvent;
export type ObserverBeforeUnloadEvent = BaseBeforeUnloadEvent;
export type ObserverBlurEvent = BaseBlurEvent;
export type ObserverHoverEvent = BaseHoverEvent;

interface ExtraWheelEventInit {
  deltaMode?: number;
  deltaX?: number;
  deltaY?: number;
  deltaZ?: number;
}

export interface ObserverWheelEvent
  extends ExtraWheelEventInit,
    BaseWheelEvent {}

export interface ObserverDragEvent extends BaseDragEvent, ExtraMouseEventInit {}
export interface ObserverDragStartEvent
  extends BaseDragStartEvent<File>,
    ExtraMouseEventInit {}
export interface ObserverDragEndEvent
  extends BaseDragEndEvent,
    ExtraMouseEventInit {}
export interface ObserverDragEnterEvent
  extends BaseDragEnterEvent,
    ExtraMouseEventInit {}
export interface ObserverDragOverEvent
  extends BaseDragOverEvent,
    ExtraMouseEventInit {}
export interface ObserverDragLeaveEvent
  extends BaseDragLeaveEvent,
    ExtraMouseEventInit {}
export interface ObserverDropEvent
  extends BaseDropEvent<File>,
    ExtraMouseEventInit {}
export type ObserverBrowseFileEvent = BaseBrowseFileEvent<File>;
export type ObserverResizeEvent = BaseResizeEvent;

export type EventObserverStepEvent =
  | ObserverMousedownEvent
  | ObserverMouseupEvent
  | ObserverClickEvent
  | ObserverAuxClickEvent
  | ObserverDblClickEvent
  | ObserverMousemoveEvent
  | ObserverScrollEvent
  | ObserverKeydownEvent
  | ObserverKeypressEvent
  | ObserverKeyupEvent
  | ObserverTextInputEvent
  | ObserverTextChangeEvent
  | ObserverBlurEvent
  | ObserverLoadEvent
  | ObserverBeforeUnloadEvent
  | ObserverHoverEvent
  | ObserverWheelEvent
  | ObserverDragEvent
  | ObserverDragStartEvent
  | ObserverDragEndEvent
  | ObserverDragEnterEvent
  | ObserverDragOverEvent
  | ObserverDragLeaveEvent
  | ObserverDropEvent
  | ObserverBrowseFileEvent
  | ObserverResizeEvent;

declare global {
  interface UIEvent {
    path: Array<HTMLElement>;
  }
}

export interface IObserver<TOutput> {
  name: string;
  emitter: EventEmitter2;
  start(): void;
  stop(): void;
  suspend(): void;
  on(listenerFn: ObserverListener<TOutput>): ObserverListener<TOutput>;
  off(listenerFn: ObserverListener<TOutput>): void;
}

export type ObserverListener<TOutput> = (output: TOutput) => void;

export type EventProcessor<TEvent, TOutput> = (
  event: TEvent,
  ...args: any[]
) => TOutput;
