import { StepEvent, MousemoveRecord } from './types';
import { ThrottleManager } from './util/throttler';
import { EventEmitter2 } from 'eventemitter2';
import { isInputLikeElement, on, ResetHandler, toModifiers } from './util/fn';
import { getSerializedDataTransferItemList } from './util/entry-reader';

export interface IObserver {
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
  protected getThrottler: typeof ThrottleManager.prototype.getThrottle;
  protected invokeAll: typeof ThrottleManager.prototype.invokeAll;

  constructor() {
    this.getThrottler = (...args) => {
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

  private previousDragOverTarget: EventTarget | null = null;

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
      this.observerDrag();
      this.observeFileInput();
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
    const getHandler = (
      type: 'mousedown' | 'mouseup' | 'click' | 'dblclick' | 'auxclick',
    ) => {
      return (event: MouseEvent) => {
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
        if (type === 'click' && (event as UIEvent).detail < 1) {
          return;
        }
        const { clientX, clientY, button, buttons, screenX, screenY } = event;
        this.onEmit(
          {
            type,
            button,
            buttons,
            screenX,
            screenY,
            clientX,
            clientY,
            modifiers: toModifiers(event),
            timestamp: this.now,
          },
          event.target as HTMLElement,
        );
      };
    };
    this.handlers.push(on('mousedown', getHandler('mousedown'), this.win));
    this.handlers.push(on('mouseup', getHandler('mouseup'), this.win));
    this.handlers.push(on('click', getHandler('click'), this.win));
    this.handlers.push(on('auxclick', getHandler('auxclick'), this.win));
    this.handlers.push(on('dblclick', getHandler('dblclick'), this.win));
  }

  private observeMousemove() {
    const mousemoveSymbol = Symbol('mousemove');
    const updatePosSymbol = Symbol('updatePos');
    let positions: MousemoveRecord[] = [];
    let timeBaseline: number | null = null;

    const wrappedCb = this.getThrottler(
      mousemoveSymbol,
      () => {
        this.onEmit(
          {
            type: 'mousemove',
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

    const throttledPositionFn = this.getThrottler<MouseEvent>(
      updatePosSymbol,
      (evt) => {
        const { clientX, clientY, screenX, screenY } = evt;
        if (!timeBaseline) {
          timeBaseline = this.now;
        }
        positions.push({
          clientX,
          clientY,
          screenX,
          screenY,
          timeOffset: this.now - timeBaseline,
        });
        wrappedCb();
      },
      50,
      {
        trailing: false,
      },
    );

    const updatePosition = (evt: Event) => {
      if (!this.active) {
        return;
      }
      throttledPositionFn(evt);
    };

    this.handlers.push(on('mousemove', updatePosition, this.win));
  }

  private observeScroll() {
    const symbolList = new Map<EventTarget | null, symbol>();
    const updatePosition = this.getThrottler<UIEvent>(
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
              type: 'scroll',
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
              type: 'scroll',
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
    const getHandler = (type: 'keydown' | 'keypress' | 'keyup') => {
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
    this.handlers.push(on('keydown', getHandler('keydown'), this.win));
    this.handlers.push(on('keypress', getHandler('keypress'), this.win));
    this.handlers.push(on('keyup', getHandler('keyup'), this.win));
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
            type: 'text_input',
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
      if (!isInputLikeElement(target)) {
        return;
      } else {
        if (target.tagName === 'INPUT') {
          return this.onEmit(
            {
              type: 'text_change',
              value: target.value,
              timestamp: this.now,
            },
            target,
          );
        } else if (target.isContentEditable) {
          return this.onEmit(
            {
              type: 'text_change',
              value: target.innerHTML,
              timestamp: this.now,
            },
            target,
          );
        }
      }
    };
    this.handlers.push(on('input', handler, this.win));
    this.handlers.push(on('input', changeHandler, this.win));
  }

  private observeBlur() {
    const handler = (event: FocusEvent) => {
      if (!this.active) {
        return;
      }
      this.onEmit(
        {
          type: 'blur',
          timestamp: this.now,
        },
        event.target as HTMLElement,
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
          type: 'before_unload',
          timestamp: this.now,
        },
        null,
      );
    };
    this.handlers.push(on('beforeunload', handler, this.win));
  }

  private observeWheel() {
    const wheelSymbol = Symbol('wheel');
    const handler = this.getThrottler(
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
              type: 'wheel',
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

  private observerDrag() {
    const dragSymbol = Symbol('drag');
    const dragStartHandler = async (event: DragEvent) => {
      if (!this.active) {
        return;
      }
      // reset previous dragover target on start;
      this.previousDragOverTarget = null;
      const {
        clientX,
        clientY,
        screenX,
        screenY,
        button,
        buttons,
        dataTransfer,
      } = event;
      this.onEmit(
        {
          type: 'dragstart',
          timestamp: this.now,
          clientX,
          clientY,
          screenX,
          screenY,
          button,
          buttons,
          modifiers: toModifiers(event),
          targetIndex: 0,
          effectAllowed: dataTransfer?.effectAllowed || 'uninitialized',
          items: await getSerializedDataTransferItemList(event.dataTransfer),
        },
        event.target as HTMLElement,
      );
    };
    // drag will trigger multiple times
    const dragHandler = this.getThrottler<DragEvent>(
      dragSymbol,
      (event: DragEvent) => {
        if (!this.active) {
          return;
        }
        const { clientX, clientY, screenX, screenY, button, buttons } = event;
        this.onEmit(
          {
            type: 'drag',
            timestamp: this.now,
            clientX,
            clientY,
            screenX,
            screenY,
            button,
            buttons,
            modifiers: toModifiers(event),
            targetIndex: 0,
          },
          null,
          true,
        );
      },
      500,
    );

    // only record dragover on different element;
    const dragOverHandler = (event: DragEvent) => {
      if (!this.active) {
        return;
      }
      if (event.target !== this.previousDragOverTarget) {
        const { clientX, clientY, screenX, screenY, button, buttons } = event;
        this.onEmit(
          {
            type: 'dragover',
            timestamp: this.now,
            clientX,
            clientY,
            screenX,
            screenY,
            button,
            buttons,
            dropEffect: event.dataTransfer?.dropEffect || 'none',
            modifiers: toModifiers(event),
            targetIndex: 0,
          },
          null,
          true,
        );
        this.previousDragOverTarget = event.target;
      }
    };

    const dragEndHandler = (event: DragEvent) => {
      if (!this.active) {
        return;
      }
      const { clientX, clientY, screenX, screenY, button, buttons } = event;
      this.onEmit(
        {
          type: 'dragend',
          timestamp: this.now,
          clientX,
          clientY,
          screenX,
          screenY,
          button,
          buttons,
          modifiers: toModifiers(event),
          targetIndex: 0,
        },
        event.target as HTMLElement,
      );
      // reset previous dragover target when drag is ended;
      this.previousDragOverTarget = null;
    };

    const dropHandler = async (event: DragEvent) => {
      if (!this.active) {
        return;
      }
      const {
        clientX,
        clientY,
        screenX,
        screenY,
        button,
        buttons,
        dataTransfer,
      } = event;
      this.onEmit(
        {
          type: 'drop',
          timestamp: this.now,
          clientX,
          clientY,
          screenX,
          screenY,
          button,
          buttons,
          modifiers: toModifiers(event),
          targetIndex: 0,
          dropEffect: dataTransfer?.dropEffect || 'none',
          effectAllowed: dataTransfer?.effectAllowed || 'uninitialized',
          items: await getSerializedDataTransferItemList(dataTransfer),
        },
        event.target as HTMLElement,
      );
    };

    const getHandler = (type: 'dragenter' | 'dragleave') => {
      return (event: DragEvent) => {
        if (!this.active) {
          return;
        }
        const { clientX, clientY, screenX, screenY, button, buttons } = event;
        this.onEmit(
          {
            type: type,
            timestamp: this.now,
            clientX,
            clientY,
            screenX,
            screenY,
            button,
            buttons,
            modifiers: toModifiers(event),
            targetIndex: 0,
          },
          null,
          true,
        );
      };
    };

    // to get the correct datatransfer object, get it from bubbles phase.
    this.handlers.push(
      on('dragstart', dragStartHandler, this.win, {
        passive: true,
        capture: false,
      }),
    );
    this.handlers.push(on('drag', dragHandler, this.win));
    this.handlers.push(on('dragover', dragOverHandler, this.win));
    this.handlers.push(on('dragenter', getHandler('dragenter'), this.win));
    this.handlers.push(on('dragleave', getHandler('dragleave'), this.win));
    this.handlers.push(on('drop', dropHandler, this.win));
    this.handlers.push(on('dragend', dragEndHandler, this.win));
  }

  private observeFileInput() {
    const handler = (event: Event) => {
      if (!this.active || !event.target) {
        return;
      }
      const target = event.target as HTMLInputElement;
      if (target.type !== 'file') {
        return;
      }
      this.onEmit(
        {
          type: 'file',
          files: target.files ? [...target.files] : [],
          timestamp: this.now,
        },
        target,
      );
    };

    this.handlers.push(on('change', handler, this.win));
  }

  private get now() {
    return new Date().getTime();
  }

  private get active(): boolean {
    return this.state === 'active';
  }
}
