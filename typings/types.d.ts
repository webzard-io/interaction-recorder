import { IMeta } from './util/metaquerier';
export declare enum MatcherKey {
    NEW_EVENT = "matcher.newEvent",
    EMIT = "matchere.emit"
}
export declare type Step = {
    selector: IMeta;
    type: 'CLICK' | 'DRAG' | 'TEXT' | 'SCROLL' | 'UNKNOWN';
    events: StepEvent[];
};
export declare type StepEvent = MouseEvents | ScrollEvent | KeydownEvent | KeypressEvent | TextInputEvent | TextChangeEvent | KeyupEvent | BlurEvent | MachineBeforeUnloadEvent | HoverEvent | MachineWheelEvent;
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
export declare type MousemoveEvent = BaseEvent & {
    type: 'mousemove';
    positions: Array<MousemoveRecord>;
};
declare type MouseEvents = MousedownEvent | MouseupEvent | ClickEvent | MousemoveEvent;
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
export {};
