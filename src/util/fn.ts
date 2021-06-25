import { Modifiers } from '../types';

export type ResetHandler = () => void;
export type onOptions = {
  capture?: boolean;
  passive?: boolean;
};
export function on(
  type: string,
  fn: EventListenerOrEventListenerObject,
  target: Document | Window,
  options: onOptions = {
    capture: true,
    passive: true,
  },
): ResetHandler {
  target.addEventListener(type, fn, options);
  return () => target.removeEventListener(type, fn, options);
}

export function toModifiers(options: {
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}): Modifiers {
  return {
    ctrl: options.ctrlKey || undefined,
    alt: options.altKey || undefined,
    shift: options.shiftKey || undefined,
    meta: options.metaKey || undefined,
  };
}
