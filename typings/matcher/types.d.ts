import { StateSchema } from 'xstate';
import { BaseAuxClickEvent, BaseBeforeUnloadEvent, BaseWheelEvent, BaseBlurEvent, BaseBrowseFileEvent, BaseClickEvent, BaseDblClickEvent, BaseDragEndEvent, BaseDragEnterEvent, BaseDragLeaveEvent, BaseDragOverEvent, BaseDragStartEvent, BaseDropEvent, BaseHoverEvent, BaseKeydownEvent, BaseKeypressEvent, BaseKeyupEvent, BaseMousedownEvent, BaseMousemoveEvent, BaseMouseupEvent, BaseScrollEvent, BaseTextChangeEvent, BaseTextInputEvent, Step, BaseStepEvent, BaseLoadEvent, BaseResizeEvent, BaseDragEvent } from '../types';
export interface MatcherContext<TStepEvent extends BaseStepEvent = BaseStepEvent> {
    currentStep?: MatcherStep<TStepEvent>;
    previousStep?: MatcherStep<TStepEvent>;
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
    data: BaseMousedownEvent;
    target: MatcherElement | null;
} | {
    type: 'mouseup';
    data: BaseMouseupEvent;
    target: MatcherElement | null;
} | {
    type: 'click';
    data: BaseClickEvent;
    target: MatcherElement | null;
} | {
    type: 'dblclick';
    data: BaseDblClickEvent;
    target: MatcherElement | null;
} | {
    type: 'auxclick';
    data: BaseAuxClickEvent;
    target: MatcherElement | null;
} | {
    type: 'mousemove';
    data: BaseMousemoveEvent;
    target: MatcherElement | null;
} | {
    type: 'scroll';
    data: BaseScrollEvent;
    target: MatcherElement | null;
} | {
    type: 'keydown';
    data: BaseKeydownEvent;
    target: MatcherElement | null;
} | {
    type: 'keypress';
    data: BaseKeypressEvent;
    target: MatcherElement | null;
} | {
    type: 'keyup';
    data: BaseKeyupEvent;
    target: MatcherElement | null;
} | {
    type: 'text_input';
    data: BaseTextInputEvent;
    target: MatcherElement | null;
} | {
    type: 'text_change';
    data: BaseTextChangeEvent;
    target: MatcherElement | null;
} | {
    type: 'blur';
    data: BaseBlurEvent;
    target: MatcherElement | null;
} | {
    type: 'load';
    data: BaseLoadEvent;
    target: MatcherElement | null;
} | {
    type: 'before_unload';
    data: BaseBeforeUnloadEvent;
    target: MatcherElement | null;
} | {
    type: 'hover';
    data: BaseHoverEvent;
    target: MatcherElement | null;
} | {
    type: 'wheel';
    data: BaseWheelEvent;
    target: MatcherElement | null;
} | {
    type: 'drag';
    data: BaseDragEvent;
    target: MatcherElement | null;
} | {
    type: 'dragstart';
    data: BaseDragStartEvent<unknown>;
    target: MatcherElement | null;
} | {
    type: 'dragend';
    data: BaseDragEndEvent;
    target: MatcherElement | null;
} | {
    type: 'dragenter';
    data: BaseDragEnterEvent;
    target: MatcherElement | null;
} | {
    type: 'dragover';
    data: BaseDragOverEvent;
    target: MatcherElement | null;
} | {
    type: 'dragleave';
    data: BaseDragLeaveEvent;
    target: MatcherElement | null;
} | {
    type: 'drop';
    data: BaseDropEvent<unknown>;
    target: MatcherElement | null;
} | {
    type: 'file';
    data: BaseBrowseFileEvent<unknown>;
    target: MatcherElement | null;
} | {
    type: 'resize';
    data: BaseResizeEvent;
    target: MatcherElement | null;
};
export declare type MatcherState<TStepEvent extends BaseStepEvent = BaseStepEvent> = {
    value: 'INIT';
    context: MatcherContext<TStepEvent>;
} | {
    value: 'CLICK';
    context: MatcherContext<TStepEvent>;
} | {
    value: 'RIGHT_CLICK';
    context: MatcherContext<TStepEvent>;
} | {
    value: 'DBLCLICK';
    context: MatcherContext<TStepEvent>;
} | {
    value: 'DRAG';
    context: MatcherContext<TStepEvent>;
} | {
    value: 'KEYPRESS';
    context: MatcherContext<TStepEvent>;
} | {
    value: 'TEXT';
    context: MatcherContext<TStepEvent>;
} | {
    value: 'BROWSE_FILE';
    context: MatcherContext<TStepEvent>;
} | {
    value: 'NAVIGATION';
    context: MatcherContext<TStepEvent>;
} | {
    value: 'SCROLL';
    context: MatcherContext<TStepEvent>;
} | {
    value: 'REFRESH';
    context: MatcherContext<TStepEvent>;
} | {
    value: 'RESIZE';
    context: MatcherContext<TStepEvent>;
} | {
    value: 'UNKNOWN';
    context: MatcherContext<TStepEvent>;
};
export declare type MatcherStep<TStepEvent extends BaseStepEvent = BaseStepEvent> = Omit<Step<TStepEvent>, 'selector'> & {
    target: MatcherElement | null;
    secondary_target: MatcherElement[];
};
export declare type MatcherElement = {
    id: string;
    tagName: string;
    attributes: Record<string, string>;
};
export declare type MachineMatcherInput<TStepEvent extends BaseStepEvent> = {
    element: MatcherElement | null;
    event: TStepEvent;
};
export declare type emitType = 'new' | 'end' | 'update';
export declare type emitFn<TStepEvent extends BaseStepEvent> = (type: emitType, step: MatcherStep<TStepEvent>) => void;
