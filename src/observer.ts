import { Modifiers, StepEvent, MousemoveRecord } from './types';
import { EventBus, EventHandler, RegisterOptions } from './util/eventbus';
import { ThrottleManager } from './util/throttler';

type ResetHandler = () => void;
type EmitHandler = (event: StepEvent, target: HTMLElement | null) => void;

function on(
  type: string,
  fn: EventListenerOrEventListenerObject,
  target: Document | Window,
  options: AddEventListenerOptions = { capture: true, passive: true },
): ResetHandler {
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

export type ObserverOptions = {
  doc: Document;
  win: Window;
  onEmit: EmitHandler;
  onMouseDown?: EventHandler;
  onMouseUp?: EventHandler;
  onClick?: EventHandler;
  onMouseMove?: EventHandler;
  onScroll?: EventHandler;
  onKeyDown?: EventHandler;
  onKeyPress?: EventHandler;
  onKeyUp?: EventHandler;
  onTextInput?: EventHandler;
  onBlur?: EventHandler;
};

export const EventSymbol = {
  mouseDown: Symbol('mousedown'),
  mouseUp: Symbol('mouseup'),
  click: Symbol('click'),
  mouseMove: Symbol('mousemove'),
  scroll: Symbol('scroll'),
  keyDown: Symbol('keydown'),
  keyPress: Symbol('keypress'),
  keyUp: Symbol('keyup'),
  textInput: Symbol('textinput'),
  blur: Symbol('blur'),
};

export class EventObserver {
  private win: Window;
  private doc: Document;
  private onEmit: (
    event: StepEvent,
    target: HTMLElement | null,
    fromThrottler?: boolean,
  ) => void;
  private handlers: ResetHandler[] = [];

  private active = false;
  private started = false;

  private throttleMananger = new ThrottleManager();

  private eventBus = new EventBus();

  constructor(options: ObserverOptions) {
    const {
      win,
      doc,
      onEmit,
      onMouseDown,
      onMouseUp,
      onClick,
      onMouseMove,
      onScroll,
      onKeyDown,
      onKeyPress,
      onKeyUp,
      onTextInput,
      onBlur,
    } = options;
    this.win = win;
    this.doc = doc;
    this.onEmit = (event, target, fromThrottler = false) => {
      !fromThrottler && this.throttleMananger.invokeAll();
      onEmit(event, target);
    };
    // register event callback by given fn or default fn;
    this.registerKeyboardInteractions(onKeyDown, onKeyPress, onKeyUp);
    this.registerMouseInteractions(onMouseDown, onMouseUp, onClick);
    this.registerMousemove(onMouseMove);
    this.registerScroll(onScroll);
    this.registerTextInput(onTextInput);
    this.registerBlur(onBlur);
  }
  //#region public
  public start(): void {
    this.active = true;
    if (!this.started) {
      // start observing when first start;
      this.observeMouseInteractions();
      this.observeMousemove();
      this.observeScroll();
      this.observeKeyboardInteractions();
      this.observeTextInput();
      this.observeBlur();
      this.started = true;
    }
  }

  // suspend event listener to make it not send command;
  public suspend(): void {
    this.active = false;
  }

  public registerEvent(
    key: string | symbol,
    handler: EventHandler,
    options: RegisterOptions | undefined,
  ): EventHandler[] {
    return this.eventBus.register(key, handler, options);
  }

  public unregisterEvent(
    key: string | symbol,
    target?: EventHandler,
  ): EventHandler[] {
    return this.eventBus.unregister(key, target);
  }
  //#endregion public
  private observeMouseInteractions() {
    this.handlers.push(
      on(
        'mousedown',
        (evt) =>
          this.active && this.eventBus.invoke(EventSymbol.mouseDown, evt),
        this.win,
      ),
    );
    this.handlers.push(
      on(
        'mouseup',
        (evt) => this.active && this.eventBus.invoke(EventSymbol.mouseUp, evt),
        this.win,
      ),
    );
    this.handlers.push(
      on(
        'click',
        (evt) => this.active && this.eventBus.invoke(EventSymbol.click, evt),
        this.win,
      ),
    );
  }

  private registerMouseInteractions(
    mouseDownFn?: EventHandler,
    mouseUpFn?: EventHandler,
    clickFn?: EventHandler,
  ) {
    const getHandler = (type: 'MOUSEDOWN' | 'MOUSEUP' | 'CLICK') => {
      return (evt: Event) => {
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
    this.eventBus.register(
      EventSymbol.mouseDown,
      mouseDownFn || getHandler('MOUSEDOWN'),
    );
    this.eventBus.register(
      EventSymbol.mouseUp,
      mouseUpFn || getHandler('MOUSEUP'),
    );
    this.eventBus.register(EventSymbol.click, clickFn || getHandler('CLICK'));
  }

  private observeMousemove() {
    this.handlers.push(
      on(
        'mousemove',
        (evt) => {
          this.active && this.eventBus.invoke(EventSymbol.mouseMove, evt);
        },
        this.win,
      ),
    );
  }

  private registerMousemove(mouseMoveFn?: EventHandler) {
    if (!mouseMoveFn) {
      const mousemoveSymbol = Symbol('mousemove');
      const updatePosSymbol = Symbol('updatePos');

      let positions: MousemoveRecord[] = [];
      let timeBaseline: number | null = null;

      const wrappedCb = this.throttleMananger.getThrottle(
        mousemoveSymbol,
        () => {
          if (this.active) {
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
          );
          positions = [];
          timeBaseline = null;
        },
        500,
      );
      mouseMoveFn = this.throttleMananger.getThrottle<MouseEvent>(
        updatePosSymbol,
        (evt) => {
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
    }

    this.eventBus.register(EventSymbol.mouseMove, mouseMoveFn);
  }

  private observeScroll() {
    this.handlers.push(
      on(
        'scroll',
        (evt) => {
          this.active && this.eventBus.invoke(EventSymbol.scroll, evt);
        },
        this.win,
      ),
    );
  }

  private registerScroll(scrollFn?: EventHandler) {
    if (!scrollFn) {
      const symbolList = new Map<EventTarget | null, symbol>();
      scrollFn = this.throttleMananger.getThrottle<UIEvent>(
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
    }

    this.eventBus.register(EventSymbol.scroll, scrollFn);
  }

  private observeKeyboardInteractions() {
    this.handlers.push(
      on(
        'keydown',
        (evt) => this.active && this.eventBus.invoke(EventSymbol.keyDown, evt),
        this.win,
      ),
    );
    this.handlers.push(
      on(
        'keypress',
        (evt) => this.active && this.eventBus.invoke(EventSymbol.keyPress, evt),
        this.win,
      ),
    );
    this.handlers.push(
      on(
        'keyup',
        (evt) => this.active && this.eventBus.invoke(EventSymbol.keyUp, evt),
        this.win,
      ),
    );
  }

  private registerKeyboardInteractions(
    keyDownFn?: EventHandler,
    keyPressFn?: EventHandler,
    keyUpFn?: EventHandler,
  ) {
    const getHandler = (type: 'KEYDOWN' | 'KEYPRESS' | 'KEYUP') => {
      return (evt: Event) => {
        const { key, keyCode } = evt as KeyboardEvent;
        this.onEmit(
          {
            type,
            key,
            keyCode,
            modifiers: toModifiers(evt as KeyboardEvent),
            timestamp: this.now,
          },
          evt.target as HTMLElement,
        );
      };
    };
    this.eventBus.register(
      EventSymbol.keyDown,
      keyDownFn || getHandler('KEYDOWN'),
    );
    this.eventBus.register(
      EventSymbol.keyPress,
      keyPressFn || getHandler('KEYPRESS'),
    );
    this.eventBus.register(EventSymbol.keyUp, keyUpFn || getHandler('KEYUP'));
  }

  private observeTextInput() {
    this.handlers.push(
      on(
        'input',
        (evt) => {
          this.active && this.eventBus.invoke(EventSymbol.textInput, evt);
        },
        this.win,
      ),
    );
  }

  private registerTextInput(textFn?: EventHandler) {
    if (!textFn) {
      textFn = (evt: Event) => {
        const { data } = evt as InputEvent;
        if (data !== null && data !== undefined && evt.target) {
          this.onEmit(
            {
              type: 'TEXT_INPUT',
              data,
              value: (evt.target as HTMLInputElement).value,
              timestamp: this.now,
            },
            evt.target as HTMLElement,
          );
        }
      };
    }

    this.eventBus.register(EventSymbol.textInput, textFn);
  }

  private observeBlur() {
    this.handlers.push(
      on(
        'blur',
        (evt) => {
          this.active && this.eventBus.invoke(EventSymbol.blur, evt);
        },
        this.win,
      ),
    );
  }

  private registerBlur(blurFn?: EventHandler) {
    if (!blurFn) {
      blurFn = () =>
        this.onEmit(
          {
            type: 'BLUR',
            timestamp: this.now,
          },
          null,
        );
    }

    this.eventBus.register(EventSymbol.blur, blurFn);
  }

  private get now() {
    return new Date().getTime();
  }
}
