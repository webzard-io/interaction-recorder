import { Modifiers } from '../types';
export declare type ResetHandler = () => void;
export declare type onOptions = {
    capture?: boolean;
    passive?: boolean;
};
export declare function on<K extends keyof DocumentEventMap>(type: K, fn: (this: Document, ev: DocumentEventMap[K]) => unknown, target: Document, option?: onOptions): ResetHandler;
export declare function on<K extends keyof WindowEventMap>(type: K, fn: (this: Window, ev: WindowEventMap[K]) => unknown, target: Window, option?: onOptions): ResetHandler;
export declare function on<K extends keyof HTMLElementEventMap>(type: K, fn: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, target: HTMLElement, option?: onOptions): ResetHandler;
declare type IModifier = {
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    metaKey: boolean;
};
export declare function toModifiers(options: IModifier): Modifiers;
export declare const isInputLikeElement: (element: HTMLElement) => element is HTMLInputElement | HTMLTextAreaElement;
export declare const randomId: (length?: number) => string;
export {};
