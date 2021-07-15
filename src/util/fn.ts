import { Modifiers } from '../types';

export type ResetHandler = () => void;
export type onOptions = {
  capture?: boolean;
  passive?: boolean;
};

export function on<K extends keyof DocumentEventMap>(
  type: K,
  fn: (this: Document, ev: DocumentEventMap[K]) => unknown,
  target: Document,
  option?: onOptions,
): ResetHandler;
export function on<K extends keyof WindowEventMap>(
  type: K,
  fn: (this: Window, ev: WindowEventMap[K]) => unknown,
  target: Window,
  option?: onOptions,
): ResetHandler;
export function on<K extends keyof HTMLElementEventMap>(
  type: K,
  fn: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown,
  target: HTMLElement,
  option?: onOptions,
): ResetHandler;
export function on(
  type: string,
  fn: (this: Window | Document | HTMLElement, ev: any) => unknown,
  target: Window | Document | HTMLElement,
  option: onOptions = { capture: true, passive: true },
): ResetHandler {
  if (target instanceof Window) {
    target.addEventListener(type, fn, option);
    return () => target.removeEventListener(type, fn, option);
  } else if (target instanceof Document) {
    target.addEventListener(type, fn, option);
    return () => target.removeEventListener(type, fn, option);
  } else if (target instanceof HTMLElement) {
    target.addEventListener(type, fn, option);
    return () => target.removeEventListener(type, fn, option);
  } else {
    throw Error('Unexpected target');
  }
}

type IModifier = {
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
};

export function toModifiers(options: IModifier): Modifiers {
  return {
    ctrlKey: options.ctrlKey || undefined,
    altKey: options.altKey || undefined,
    shiftKey: options.shiftKey || undefined,
    metaKey: options.metaKey || undefined,
  };
}

// to identify if an element is input like.
export const isInputLikeElement = (element: HTMLElement) => {
  switch (element.tagName) {
    case 'INPUT': {
      const { disabled, type } = element as HTMLInputElement;
      // input element which is not disabled and editable is an input like element
      return (
        !disabled &&
        ![
          'button',
          'checkbox',
          'color',
          'file',
          'image',
          'radio',
          'range',
          'reset',
          'submit',
        ].includes(type)
      );
    }
    case 'TEXTAREA': {
      //  textarea element not disabled
      return !(element as HTMLTextAreaElement).disabled;
    }
    default:
      // contenteditble element
      return element.isContentEditable;
  }
};
