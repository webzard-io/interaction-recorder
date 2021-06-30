import { StepEvent, MousemoveRecord } from './types';
import { ThrottleManager } from './util/throttler';
import { EventEmitter2 } from 'eventemitter2';
import { on, ResetHandler, toModifiers } from './util/fn';

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

interface IObserver {
  name: string;
  emitter: EventEmitter2;
  start(): void;
  stop(): void;
  suspend(): void;
}

export abstract class AbstractObserver implements IObserver {
  abstract name: string;
  abstract emitter: EventEmitter2;

  abstract start(): void;
  abstract stop(): void;
  abstract suspend(): void;

  private static throttleManager = new ThrottleManager();
  protected getThrottle: typeof ThrottleManager.prototype.getThrottle;
  protected invokeAll: typeof ThrottleManager.prototype.invokeAll;

  constructor() {
    this.getThrottle = (...args) => {
      return AbstractObserver.throttleManager.getThrottle(...args);
    };

    this.invokeAll = () => {
      return AbstractObserver.throttleManager.invokeAll();
    };
  }

  protected onEmit(
    event: StepEvent,
    target: HTMLElement | null,
    fromThrottler = false,
  ) {
    !fromThrottler && AbstractObserver.throttleManager.invokeAll();
    this.emitter.emit(`observer.${this.name}`, event, target);
  }
}

export class EventObserver extends AbstractObserver {
  public name = 'Event';
  public emitter = new EventEmitter2();

  private win: Window;

  private handlers: ResetHandler[] = [];

  private state: 'active' | 'inactive' | 'suspend' = 'inactive';

  constructor(win: Window) {
    super();
    this.win = win;
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
    this.handlers.push(on('mousedown', getHandler('MOUSEDOWN'), this.win));
    this.handlers.push(on('mouseup', getHandler('MOUSEUP'), this.win));
    this.handlers.push(on('click', getHandler('CLICK'), this.win));
  }

  private observeMousemove() {
    const mousemoveSymbol = Symbol('mousemove');
    const updatePosSymbol = Symbol('updatePos');
    let positions: MousemoveRecord[] = [];
    let timeBaseline: number | null = null;

    const wrappedCb = this.getThrottle(
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

    const updatePosition = this.getThrottle<MouseEvent>(
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

    this.handlers.push(on('mousemove', updatePosition, this.win));
  }

  private observeScroll() {
    const symbolList = new Map<EventTarget | null, symbol>();
    const updatePosition = this.getThrottle<UIEvent>(
      (e: UIEvent) => {
        if (!symbolList.has(e.target)) {
          symbolList.set(e.target, Symbol());
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
        if (evt.target === this.win.document) {
          const scrollEl =
            this.win.document.scrollingElement ||
            this.win.document.documentElement;
          this.onEmit(
            {
              type: 'SCROLL',
              scrollLeft: scrollEl.scrollLeft,
              scrollTop: scrollEl.scrollTop,
              timestamp: this.now,
            },
            this.win.document.body,
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
    this.handlers.push(on('scroll', updatePosition, this.win));
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
    this.handlers.push(on('keydown', getHandler('KEYDOWN'), this.win));
    this.handlers.push(on('keypress', getHandler('KEYPRESS'), this.win));
    this.handlers.push(on('keyup', getHandler('KEYUP'), this.win));
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
    this.handlers.push(on('input', handler, this.win));
    this.handlers.push(on('input', changeHandler, this.win));
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

    this.handlers.push(on('blur', handler, this.win));
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
    const handler = this.getThrottle(
      wheelSymbol,
      (evt: WheelEvent) => {
        if (!this.active) {
          return;
        }
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
    this.handlers.push(on('wheel', handler, this.win));
  }

  private get now() {
    return new Date().getTime();
  }

  private get active(): boolean {
    return this.state === 'active';
  }
}
