import { Modifiers } from '../types';
export declare type ResetHandler = () => void;
export declare type onOptions = {
    capture?: boolean;
    passive?: boolean;
};
export declare function on(type: string, fn: EventListenerOrEventListenerObject, target: Document | Window, options?: onOptions): ResetHandler;
export declare function toModifiers(options: {
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    metaKey: boolean;
}): Modifiers;
