import { IMeta } from './util/metaquerier';
export declare enum MatcherKey {
    NEW_EVENT = "matcher.newEvent",
    EMIT = "matchere.emit"
}
export declare type Step = {
    selector: IMeta;
    action: 'CLICK' | 'DRAG' | 'SCROLL' | 'TEXT';
    events: StepEvent[];
};
export declare type StepEvent = MousedownEvent | MouseupEvent | ClickEvent | MousemoveEvent | ScrollEvent | KeydownEvent | KeypressEvent | TextInputEvent | TextChangeEvent | KeyupEvent | BlurEvent | BeforeUnloadEvent | HoverEvent | WheelEvent;
export declare type Modifiers = {
    ctrl?: true;
    alt?: true;
    shift?: true;
    meta?: true;
};
export declare type MousemoveRecord = {
    clientX: number;
    clientY: number;
    timeOffset: number;
};
declare type BaseEvent = {
    timestamp: number;
};
export declare type MousedownEvent = BaseEvent & {
    type: 'MOUSEDOWN';
    clientX: number;
    clientY: number;
    modifiers: Modifiers;
};
export declare type MouseupEvent = BaseEvent & {
    type: 'MOUSEUP';
    clientX: number;
    clientY: number;
    modifiers: Modifiers;
};
export declare type ClickEvent = BaseEvent & {
    type: 'CLICK';
    clientX: number;
    clientY: number;
    modifiers: Modifiers;
};
export declare type MousemoveEvent = BaseEvent & {
    type: 'MOUSEMOVE';
    positions: Array<MousemoveRecord>;
};
export declare type ScrollEvent = BaseEvent & {
    type: 'SCROLL';
    scrollLeft: number;
    scrollTop: number;
};
export declare type KeydownEvent = BaseEvent & {
    type: 'KEYDOWN';
    key: string;
    code: string;
    keyCode: number;
    modifiers: Modifiers;
};
export declare type KeypressEvent = BaseEvent & {
    type: 'KEYPRESS';
    key: string;
    code: string;
    keyCode: number;
    modifiers: Modifiers;
};
export declare type TextInputEvent = BaseEvent & {
    type: 'TEXT_INPUT';
    data: string;
    value: string;
};
export declare type TextChangeEvent = BaseEvent & {
    type: 'TEXT_CHANGE';
    value: string;
};
export declare type KeyupEvent = BaseEvent & {
    type: 'KEYUP';
    key: string;
    code: string;
    keyCode: number;
    modifiers: Modifiers;
};
export declare type BlurEvent = BaseEvent & {
    type: 'BLUR';
};
export declare type BeforeUnloadEvent = BaseEvent & {
    type: 'BEFORE_UNLOAD';
};
export declare type HoverEvent = BaseEvent & {
    type: 'HOVER';
    clientX: number;
    clientY: number;
    modifiers: Modifiers;
};
export declare type WheelEvent = BaseEvent & {
    type: 'WHEEL';
};
export {};
