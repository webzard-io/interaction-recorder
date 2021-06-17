import { Modifiers, StepEvent, MousemoveRecord } from './types';

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

type throttleOptions = {
  leading?: boolean;
  trailing?: boolean;
};
function throttle<T>(
  func: (arg: T) => void,
  wait: number,
  options: throttleOptions = {},
) {
  let timeout: number | null = null;
  let previous = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (this: any) {
    const now = Date.now();
    if (!previous && options.leading === false) {
      previous = now;
    }
    const remaining = wait - (now - previous);

    // eslint-disable-next-line prefer-rest-params, @typescript-eslint/no-explicit-any
    const args = arguments as any;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        window.clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(this, args);
    } else if (!timeout && options.trailing !== false) {
      timeout = window.setTimeout(() => {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        func.apply(this, args);
      }, remaining);
    }
  };
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

export class EventObserver {
  private win: Window;
  private doc: Document;
  private onEmit: EmitHandler;
  private handlers: ResetHandler[] = [];

  private state: 'active' | 'inactive' = 'inactive';

  constructor(win: Window, doc: Document, onEmit: EmitHandler) {
    this.win = win;
    this.doc = doc;
    this.onEmit = onEmit;
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
      this.state = 'active';
    }
  }

  public stop(): void {
    if (this.state === 'active') {
      this.handlers.forEach((h) => h());
      this.handlers.length = 0;
      this.state = 'inactive';
    }
  }

  private observeMouseInteractions() {
    const getHandler = (type: 'MOUSEDOWN' | 'MOUSEUP' | 'CLICK') => {
      return (evt: Event) => {
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
            timestamp: this.now(),
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
    let positions: MousemoveRecord[] = [];
    let timeBaseline: number | null = null;

    const wrappedCb = throttle(() => {
      this.onEmit(
        {
          type: 'MOUSEMOVE',
          positions,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          timestamp: timeBaseline!,
        },
        null,
      );
      positions = [];
      timeBaseline = null;
    }, 500);

    const updatePosition = throttle<MouseEvent>(
      (evt) => {
        const { clientX, clientY } = evt;
        if (!timeBaseline) {
          timeBaseline = this.now();
        }
        positions.push({
          clientX,
          clientY,
          timeOffset: this.now() - timeBaseline,
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
    const updatePosition = throttle<UIEvent>((evt) => {
      if ((evt.target as HTMLElement).tagName === 'INPUT') {
        return;
      }
      if (evt.target === this.doc) {
        const scrollEl = this.doc.scrollingElement || this.doc.documentElement;
        this.onEmit(
          {
            type: 'SCROLL',
            scrollLeft: scrollEl.scrollLeft,
            scrollTop: scrollEl.scrollTop,
            timestamp: this.now(),
          },
          this.doc.body,
        );
      } else {
        const target = evt.target as HTMLElement;
        this.onEmit(
          {
            type: 'SCROLL',
            scrollLeft: target.scrollLeft,
            scrollTop: target.scrollTop,
            timestamp: this.now(),
          },
          target,
        );
      }
    }, 1000);
    this.handlers.push(on('scroll', updatePosition, this.doc));
  }

  private observeKeyboardInteractions() {
    const getHandler = (type: 'KEYDOWN' | 'KEYPRESS' | 'KEYUP') => {
      return (evt: Event) => {
        const { key, code, keyCode } = evt as KeyboardEvent;
        this.onEmit(
          {
            type,
            key,
            code,
            keyCode,
            modifiers: toModifiers(evt as KeyboardEvent),
            timestamp: this.now(),
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
      const { data } = evt as InputEvent;
      if (data !== null && data !== undefined && evt.target) {
        this.onEmit(
          {
            type: 'TEXT_INPUT',
            data,
            value: (evt.target as HTMLInputElement).value,
            timestamp: this.now(),
          },
          evt.target as HTMLElement,
        );
      }
    };
    this.handlers.push(on('input', handler, this.doc));
  }

  private observeBlur() {
    const handler = () =>
      this.onEmit(
        {
          type: 'BLUR',
          timestamp: this.now(),
        },
        null,
      );
    this.handlers.push(on('blur', handler, this.doc));
  }

  private observeBeforeUnload() {
    const handler = () => {
      this.onEmit(
        {
          type: 'BEFORE_UNLOAD',
          timestamp: this.now(),
        },
        null,
      );
    };
    this.handlers.push(on('beforeunload', handler, this.win));
  }

  private now() {
    return new Date().getTime();
  }
}
