import { Modifiers, StepEvent, MousemoveRecord } from './types';
import { ThrottleManager } from './util/throttler';

type ResetHandler = () => void;
type EmitHandler = (event: StepEvent, target: HTMLElement | null) => void;

function on(
  type: string,
  fn: EventListenerOrEventListenerObject,
  target: Document | Window,
): ResetHandler {
  const options = { capture: true, passive: true };
  target.addEventListener(type, fn, options);
  return () => target.removeEventListener(type, fn, options);
}

function toModifiers(options: {
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

function isFileInput(el: HTMLElement): el is HTMLInputElement {
  return el.tagName === 'INPUT' && (el as HTMLInputElement).type === 'file';
}

function isTextElement(
  el: HTMLElement,
): el is HTMLInputElement | HTMLTextAreaElement {
  return ['INPUT', 'TEXTAREA'].includes(el.tagName);
}

function isTextInputElement(
  el: HTMLElement,
): el is HTMLInputElement | HTMLTextAreaElement {
  return isTextElement(el) && !isFileInput(el);
}

function isContentEditable(el: HTMLElement) {
  return el.contentEditable === 'true';
}

export class EventObserver {
  private win: Window;
  private doc: Document;
  private onEmit: (
    event: StepEvent,
    target: HTMLElement | null,
    fromThrottler?: boolean,
  ) => void;
  private handlers: ResetHandler[] = [];

  private state: 'active' | 'inactive' | 'suspend' = 'inactive';

  private throttleManager = new ThrottleManager();

  constructor(win: Window, doc: Document, onEmit: EmitHandler) {
    this.win = win;
    this.doc = doc;
    this.onEmit = (event, target, fromThrottler = false) => {
      !fromThrottler && this.throttleManager.invokeAll();
      onEmit(event, target);
    };
  }

  public start(): void {
    if (this.state === 'inactive') {
      this.observeMouseInteractions();
      this.observeMousemove();
      this.observeScroll();
      this.observeKeyboardInteractions();
      this.observeTextInput();
      this.observeBlur();
      this.observeBeforeUnload();
      this.observeWheel();
    }
    this.state = 'active';
  }

  public suspend(): void {
    if (this.active) {
      this.state = 'suspend';
    }
  }

  public stop(): void {
    if (this.state !== 'inactive') {
      this.handlers.forEach((h) => h());
      this.handlers.length = 0;
      this.state = 'inactive';
    }
  }

  private observeMouseInteractions() {
    const getHandler = (type: 'MOUSEDOWN' | 'MOUSEUP' | 'CLICK') => {
      return (evt: Event) => {
        if (!this.active) {
          return;
        }
        /**
         * According to the HTML standard, the <input /> element
         * inside a <label /> element will use the label as its
         * control element.
         * So clicking the label will trigger a click event to
         * the input element either.
         * The triggered click event has 'isTrusted' flag being
         * set to 'true'. But we can check 'event.detail' which
         * indicates the number of click. A click event with the
         * detail of 0 must be triggered by the system.
         */
        if (type === 'CLICK' && (evt as UIEvent).detail < 1) {
          return;
        }
        const { clientX, clientY } = evt as MouseEvent;
        this.onEmit(
          {
            type,
            clientX,
            clientY,
            modifiers: toModifiers(evt as MouseEvent),
            timestamp: this.now,
          },
          evt.target as HTMLElement,
        );
      };
    };
    this.handlers.push(on('mousedown', getHandler('MOUSEDOWN'), this.doc));
    this.handlers.push(on('mouseup', getHandler('MOUSEUP'), this.doc));
    this.handlers.push(on('click', getHandler('CLICK'), this.doc));
  }

  private observeMousemove() {
    const mousemoveSymbol = Symbol('mousemove');
    const updatePosSymbol = Symbol('updatePos');
    let positions: MousemoveRecord[] = [];
    let timeBaseline: number | null = null;

    const wrappedCb = this.throttleManager.getThrottle(
      mousemoveSymbol,
      () => {
        if (!this.active) {
          return;
        }
        this.onEmit(
          {
            type: 'MOUSEMOVE',
            positions,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            timestamp: timeBaseline!,
          },
          null,
          true,
        );
        positions = [];
        timeBaseline = null;
      },
      500,
    );

    const updatePosition = this.throttleManager.getThrottle<MouseEvent>(
      updatePosSymbol,
      (evt) => {
        if (!this.active) {
          return;
        }
        const { clientX, clientY } = evt;
        if (!timeBaseline) {
          timeBaseline = this.now;
        }
        positions.push({
          clientX,
          clientY,
          timeOffset: this.now - timeBaseline,
        });
        wrappedCb();
      },
      50,
      {
        trailing: false,
      },
    );

    this.handlers.push(on('mousemove', updatePosition, this.doc));
  }

  private observeScroll() {
    const symbolList = new Map<EventTarget | null, symbol>();
    const updatePosition = this.throttleManager.getThrottle<UIEvent>(
      (e: UIEvent) => {
        if (!symbolList.has(e.target)) {
          symbolList.set(e.target, Symbol());
        }
        return symbolList.get(e.target)!;
      },
      (evt) => {
        if (!this.active) {
          return;
        }
        /**
         * We do not need scroll events in INPUT element
         * Reference: testim's recorder
         */
        if ((evt.target as HTMLElement).tagName === 'INPUT') {
          return;
        }
        if (evt.target === this.doc) {
          const scrollEl =
            this.doc.scrollingElement || this.doc.documentElement;
          this.onEmit(
            {
              type: 'SCROLL',
              scrollLeft: scrollEl.scrollLeft,
              scrollTop: scrollEl.scrollTop,
              timestamp: this.now,
            },
            this.doc.body,
            true,
          );
        } else {
          const target = evt.target as HTMLElement;
          this.onEmit(
            {
              type: 'SCROLL',
              scrollLeft: target.scrollLeft,
              scrollTop: target.scrollTop,
              timestamp: this.now,
            },
            target,
            true,
          );
        }
      },
      1000,
    );
    this.handlers.push(on('scroll', updatePosition, this.doc));
  }

  private observeKeyboardInteractions() {
    const getHandler = (type: 'KEYDOWN' | 'KEYPRESS' | 'KEYUP') => {
      return (evt: Event) => {
        if (!this.active) {
          return;
        }
        const { key, code, keyCode } = evt as KeyboardEvent;
        this.onEmit(
          {
            type,
            key,
            code,
            keyCode,
            modifiers: toModifiers(evt as KeyboardEvent),
            timestamp: this.now,
          },
          evt.target as HTMLElement,
        );
      };
    };
    this.handlers.push(on('keydown', getHandler('KEYDOWN'), this.doc));
    this.handlers.push(on('keypress', getHandler('KEYPRESS'), this.doc));
    this.handlers.push(on('keyup', getHandler('KEYUP'), this.doc));
  }

  private observeTextInput() {
    const handler = (evt: Event) => {
      if (!this.active) {
        return;
      }
      const { data } = evt as InputEvent;
      if (data !== null && data !== undefined && evt.target) {
        this.onEmit(
          {
            type: 'TEXT_INPUT',
            data,
            /**
             * text input event will not record input value any more
             * because you can find it in text change events
             */
            value: '',
            timestamp: this.now,
          },
          evt.target as HTMLElement,
        );
      }
    };
    const changeHandler = (evt: Event) => {
      if (!this.active) {
        return;
      }
      const target = evt.target as HTMLElement | null;
      if (!target) {
        return;
      }
      if (['checkbox', 'radio'].includes((target as HTMLInputElement).type)) {
        return;
      }
      if (isTextInputElement(target)) {
        return this.onEmit(
          {
            type: 'TEXT_CHANGE',
            value: target.value,
            timestamp: this.now,
          },
          target,
        );
      }
      if (isContentEditable(target)) {
        return this.onEmit(
          {
            type: 'TEXT_CHANGE',
            value: target.innerHTML,
            timestamp: this.now,
          },
          target,
        );
      }
    };
    this.handlers.push(on('input', handler, this.doc));
    this.handlers.push(on('input', changeHandler, this.doc));
  }

  private observeBlur() {
    const handler = () => {
      if (!this.active) {
        return;
      }
      this.onEmit(
        {
          type: 'BLUR',
          timestamp: this.now,
        },
        null,
      );
    };

    this.handlers.push(on('blur', handler, this.doc));
  }

  private observeBeforeUnload() {
    const handler = () => {
      if (!this.active) {
        return;
      }
      this.onEmit(
        {
          type: 'BEFORE_UNLOAD',
          timestamp: this.now,
        },
        null,
      );
    };
    this.handlers.push(on('beforeunload', handler, this.win));
  }

  private observeWheel() {
    const wheelSymbol = Symbol('wheel');
    const handler = this.throttleManager.getThrottle(
      wheelSymbol,
      (evt: WheelEvent) => {
        let target = evt.target as HTMLElement | null;
        const attributes: [
          'scrollHeight' | 'scrollWidth',
          'clientHeight' | 'clientWidth',
        ] = evt.deltaY
          ? ['scrollHeight', 'clientHeight']
          : ['scrollWidth', 'clientWidth'];
        while (target) {
          if (target[attributes[0]] > target[attributes[1]]) {
            // get the real scrolling element for target;
            break;
          }
          target = target.parentElement;
        }
        // if there is no element scrollable, do not emit the event;
        if (target) {
          this.onEmit(
            {
              type: 'WHEEL',
              timestamp: this.now,
            },
            target,
            true,
          );
        }
      },
      500,
    );
    this.handlers.push(on('wheel', handler, this.doc));
  }

  private get now() {
    return new Date().getTime();
  }

  private get active(): boolean {
    return this.state === 'active';
  }
}
