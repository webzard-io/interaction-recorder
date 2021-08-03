import { StateSchema } from 'xstate';
import { AuxClickEvent, MachineBeforeUnloadEvent, MachineWheelEvent, BlurEvent, BrowseFileEvent, ClickEvent, DblClickEvent, DragEndEvent, DragEnterEvent, DraggingEvent, DragLeaveEvent, DragOverEvent, DragStartEvent, DropEvent, HoverEvent, KeydownEvent, KeypressEvent, KeyupEvent, MousedownEvent, MousemoveEvent, MouseupEvent, ScrollEvent, TextChangeEvent, TextInputEvent, Step, StepEvent } from '../types';
export interface MatcherContext {
    currentStep?: MatcherStep;
    previousStep?: MatcherStep;
}
export interface MatcherSchema extends StateSchema {
    states: {
        INIT: {};
        CLICK: {};
        RIGHT_CLICK: {};
        DBLCLICK: {};
        DRAG: {};
        KEYPRESS: {};
        TEXT: {};
        BROWSE_FILE: {};
        DROP_FILE: {};
        NAVIGATION: {};
        SCROLL: {};
        REFRESH: {};
        RESIZE: {};
        HOVER: {};
        UNKNOWN: {};
    };
}
export declare type MatcherEvent = {
    type: 'mousedown';
    data: MousedownEvent;
    target: MatcherElement | null;
} | {
    type: 'mouseup';
    data: MouseupEvent;
    target: MatcherElement | null;
} | {
    type: 'click';
    data: ClickEvent;
    target: MatcherElement | null;
} | {
    type: 'dblclick';
    data: DblClickEvent;
    target: MatcherElement | null;
} | {
    type: 'auxclick';
    data: AuxClickEvent;
    target: MatcherElement | null;
} | {
    type: 'mousemove';
    data: MousemoveEvent;
    target: MatcherElement | null;
} | {
    type: 'scroll';
    data: ScrollEvent;
    target: MatcherElement | null;
} | {
    type: 'keydown';
    data: KeydownEvent;
    target: MatcherElement | null;
} | {
    type: 'keypress';
    data: KeypressEvent;
    target: MatcherElement | null;
} | {
    type: 'keyup';
    data: KeyupEvent;
    target: MatcherElement | null;
} | {
    type: 'text_input';
    data: TextInputEvent;
    target: MatcherElement | null;
} | {
    type: 'text_change';
    data: TextChangeEvent;
    target: MatcherElement | null;
} | {
    type: 'blur';
    data: BlurEvent;
    target: MatcherElement | null;
} | {
    type: 'before_unload';
    data: MachineBeforeUnloadEvent;
    target: MatcherElement | null;
} | {
    type: 'hover';
    data: HoverEvent;
    target: MatcherElement | null;
} | {
    type: 'wheel';
    data: MachineWheelEvent;
    target: MatcherElement | null;
} | {
    type: 'drag';
    data: DraggingEvent;
    target: MatcherElement | null;
} | {
    type: 'dragstart';
    data: DragStartEvent;
    target: MatcherElement | null;
} | {
    type: 'dragend';
    data: DragEndEvent;
    target: MatcherElement | null;
} | {
    type: 'dragenter';
    data: DragEnterEvent;
    target: MatcherElement | null;
} | {
    type: 'dragover';
    data: DragOverEvent;
    target: MatcherElement | null;
} | {
    type: 'dragleave';
    data: DragLeaveEvent;
    target: MatcherElement | null;
} | {
    type: 'drop';
    data: DropEvent;
    target: MatcherElement | null;
} | {
    type: 'file';
    data: BrowseFileEvent;
    target: MatcherElement | null;
};
export declare type MatcherState = {
    value: 'INIT';
    context: MatcherContext;
} | {
    value: 'CLICK';
    context: MatcherContext;
} | {
    value: 'RIGHT_CLICK';
    context: MatcherContext;
} | {
    value: 'DBLCLICK';
    context: MatcherContext;
} | {
    value: 'DRAG';
    context: MatcherContext;
} | {
    value: 'KEYPRESS';
    context: MatcherContext;
} | {
    value: 'TEXT';
    context: MatcherContext;
} | {
    value: 'BROWSE_FILE';
    context: MatcherContext;
} | {
    value: 'NAVIGATION';
    context: MatcherContext;
} | {
    value: 'SCROLL';
    context: MatcherContext;
} | {
    value: 'REFRESH';
    context: MatcherContext;
} | {
    value: 'RESIZE';
    context: MatcherContext;
} | {
    value: 'UNKNOWN';
    context: MatcherContext;
};
export declare type MatcherStep = Omit<Step, 'selector'> & {
    target: MatcherElement | null;
};
export declare type MatcherElement = {
    id: string;
    tagName: string;
    attributes: Record<string, string>;
};
export declare type MachineMatcherInput = {
    element: MatcherElement | null;
    event: StepEvent;
};
export declare type emitType = 'new' | 'end' | 'update';
export declare type emitFn = (type: emitType, step: MatcherStep) => void;
