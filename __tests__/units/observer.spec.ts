import { EventObserver } from '../../src/observers';
import { getRandom } from '../util/fn';
let observer: EventObserver;
describe('Observer', () => {
  beforeEach(() => {
    observer = new EventObserver(window);
  });
  it('Create an instance', () => {
    expect(observer).not.toBeNull();
  });

  it('should handle state', () => {
    // the initial state should be inactive;
    expect(observer['state']).toBe('inactive');

    // inactive -> active: active
    observer.start();
    expect(observer['state']).toBe('active');

    // active -> suspend: suspend
    observer.suspend();
    expect(observer['state']).toBe('suspend');

    // suspend -> active: active;
    observer.start();
    expect(observer['state']).toBe('active');

    // active -> inactive: inactive
    observer.stop();
    expect(observer['state']).toBe('inactive');

    // inactive -> suspend: inactive
    observer.suspend();
    expect(observer['state']).toBe('inactive');

    // suspend -> inactive: inactive
    observer.start();
    observer.suspend();
    observer.stop();
    expect(observer['state']).toBe('inactive');
  });

  describe('event handler', () => {
    let emitSpy: jasmine.Spy;
    beforeAll(() => {
      jest.useFakeTimers();
    });

    beforeEach(() => {
      // throttle manager doesn't work properly in jest dom envrionment, mock it.
      spyOn(observer['throttleManager'], 'getThrottle').and.callFake(
        (_divider, func: (...args: any[]) => void) => {
          return function (this: any, ...args: any[]) {
            _divider instanceof Function
              ? _divider.apply(this, args)
              : _divider;
            func.apply(this, args);
          };
        },
      );
      observer.start();
      observer.suspend();
      emitSpy = spyOn<any>(observer, 'onEmit');
    });

    afterEach(() => {
      emitSpy.calls.reset();
    });

    describe('observe mouse interaction', () => {
      it('should handle mousedown', () => {
        const mousedown = new MouseEvent('mousedown', {
          clientX: getRandom(0, 1000),
          clientY: getRandom(0, 1000),
        });

        document.dispatchEvent(mousedown);
        jest.runAllTimers();
        expect(emitSpy).not.toBeCalled();

        observer.start();
        document.dispatchEvent(mousedown);
        jest.runAllTimers();
        expect(emitSpy.calls.mostRecent().args[0]).toEqual(
          expect.objectContaining({
            type: 'MOUSEDOWN',
            clientX: mousedown.clientX,
            clientY: mousedown.clientY,
          }),
        );
      });

      it('should handle mouseup', () => {
        const mouseup = new MouseEvent('mouseup', {
          clientX: getRandom(0, 1000),
          clientY: getRandom(0, 1000),
        });

        document.dispatchEvent(mouseup);
        jest.runAllTimers();
        expect(emitSpy).not.toBeCalled();

        observer.start();
        document.dispatchEvent(mouseup);
        jest.runAllTimers();
        expect(emitSpy.calls.mostRecent().args[0]).toEqual(
          expect.objectContaining({
            type: 'MOUSEUP',
            clientX: mouseup.clientX,
            clientY: mouseup.clientY,
          }),
        );
      });

      it('should handle click with detail', () => {
        const click = new MouseEvent('click', {
          clientX: getRandom(0, 1000),
          clientY: getRandom(0, 1000),
          detail: 1,
        });

        document.dispatchEvent(click);
        jest.runAllTimers();
        expect(emitSpy).not.toBeCalled();

        observer.start();
        document.dispatchEvent(click);
        jest.runAllTimers();
        expect(emitSpy.calls.mostRecent().args[0]).toEqual(
          expect.objectContaining({
            type: 'CLICK',
            clientX: click.clientX,
            clientY: click.clientY,
          }),
        );
      });

      it('should handle click without detail', () => {
        const detailClick = new UIEvent('click', {
          detail: 0,
        });
        document.dispatchEvent(detailClick);
        jest.runAllTimers();
        expect(emitSpy).not.toBeCalled();
      });
    });

    it('should observe mouse move', () => {
      const mousemove = new MouseEvent('mousemove', {
        clientX: getRandom(0, 1000),
        clientY: getRandom(0, 1000),
      });

      document.dispatchEvent(mousemove);
      jest.runAllTimers();
      expect(emitSpy).not.toBeCalled();

      observer.start();
      document.dispatchEvent(mousemove);
      jest.runAllTimers();

      expect(emitSpy.calls.mostRecent()?.args[0]).toEqual(
        expect.objectContaining({
          type: 'MOUSEMOVE',
          positions: [
            expect.objectContaining({
              clientX: mousemove.clientX,
              clientY: mousemove.clientY,
            }),
          ],
        }),
      );
    });

    it('should observe scroll', () => {
      const scrollEvent = new UIEvent('scroll');

      const inputEle = document.createElement('input');
      document.body.append(inputEle);

      const divEle = document.createElement('div');
      document.body.append(divEle);

      // jsdom not support scrollTo function, link:https://github.com/jsdom/jsdom/pull/2626
      // wait for the previous pr merged to remove this comment;
      // divEle.scrollTo({
      //   left: getRandom(0, 1000),
      //   top: getRandom(0, 1000),
      // });

      document.dispatchEvent(scrollEvent);
      jest.runAllTimers();
      expect(emitSpy).not.toBeCalled();

      // scroll event on document;
      observer.start();
      document.dispatchEvent(scrollEvent);
      jest.runAllTimers();
      expect(emitSpy.calls.mostRecent().args[0]).toEqual(
        expect.objectContaining({
          type: 'SCROLL',
          scrollTop: (document.scrollingElement || document.documentElement)
            .scrollTop,
          scrollLeft: (document.scrollingElement || document.documentElement)
            .scrollLeft,
        }),
      );

      const callCounts = emitSpy.calls.count();

      //scroll event on input element should not fire emit
      inputEle.dispatchEvent(scrollEvent);
      jest.runAllTimers();
      expect(emitSpy.calls.count()).toBe(callCounts);

      //scroll event on other element
      divEle.dispatchEvent(scrollEvent);
      jest.runAllTimers();
      expect(emitSpy.calls.mostRecent().args[0]).toEqual(
        expect.objectContaining({
          type: 'SCROLL',
          scrollTop: divEle.scrollTop,
          scrollLeft: divEle.scrollLeft,
        }),
      );
    });

    describe('observe keyboard interaction', () => {
      it('should handle keydown', () => {
        const keydown = new KeyboardEvent('keydown', {
          key: 'keydown',
          code: 'keyDown',
          keyCode: getRandom(0, 100),
          ctrlKey: !!(getRandom(1, 100) % 2),
          altKey: !!(getRandom(1, 100) % 2),
          shiftKey: !!(getRandom(1, 100) % 2),
          metaKey: !!(getRandom(1, 100) % 2),
        });

        document.dispatchEvent(keydown);
        jest.runAllTimers();
        expect(emitSpy).not.toBeCalled();

        observer.start();
        document.dispatchEvent(keydown);
        jest.runAllTimers();
        expect(emitSpy.calls.mostRecent().args[0]).toEqual(
          expect.objectContaining({
            type: 'KEYDOWN',
            key: keydown.key,
            code: keydown.code,
            keyCode: keydown.keyCode,
            modifiers: {
              ctrl: keydown.ctrlKey || undefined,
              alt: keydown.altKey || undefined,
              shift: keydown.shiftKey || undefined,
              meta: keydown.metaKey || undefined,
            },
          }),
        );
      });

      it('should handle keyup', () => {
        const keyup = new KeyboardEvent('keyup', {
          key: 'keyup',
          code: 'keyUp',
          keyCode: getRandom(0, 100),
          ctrlKey: !!(getRandom(1, 100) % 2),
          altKey: !!(getRandom(1, 100) % 2),
          shiftKey: !!(getRandom(1, 100) % 2),
          metaKey: !!(getRandom(1, 100) % 2),
        });

        document.dispatchEvent(keyup);
        jest.runAllTimers();
        expect(emitSpy).not.toBeCalled();

        observer.start();
        document.dispatchEvent(keyup);
        jest.runAllTimers();
        expect(emitSpy.calls.mostRecent().args[0]).toEqual(
          expect.objectContaining({
            type: 'KEYUP',
            key: keyup.key,
            code: keyup.code,
            keyCode: keyup.keyCode,
            modifiers: {
              ctrl: keyup.ctrlKey || undefined,
              alt: keyup.altKey || undefined,
              shift: keyup.shiftKey || undefined,
              meta: keyup.metaKey || undefined,
            },
          }),
        );
      });

      it('should handle keypress', () => {
        const keypress = new KeyboardEvent('keypress', {
          key: 'keypress',
          code: 'keyPress',
          keyCode: getRandom(0, 100),
          ctrlKey: !!(getRandom(1, 100) % 2),
          altKey: !!(getRandom(1, 100) % 2),
          shiftKey: !!(getRandom(1, 100) % 2),
          metaKey: !!(getRandom(1, 100) % 2),
        });

        document.dispatchEvent(keypress);
        jest.runAllTimers();
        expect(emitSpy).not.toBeCalled();

        observer.start();
        document.dispatchEvent(keypress);
        jest.runAllTimers();
        expect(emitSpy.calls.mostRecent().args[0]).toEqual(
          expect.objectContaining({
            type: 'KEYPRESS',
            key: keypress.key,
            code: keypress.code,
            keyCode: keypress.keyCode,
            modifiers: {
              ctrl: keypress.ctrlKey || undefined,
              alt: keypress.altKey || undefined,
              shift: keypress.shiftKey || undefined,
              meta: keypress.metaKey || undefined,
            },
          }),
        );
      });
    });

    describe('observer text input', () => {
      const inputEvent = new InputEvent('input', {
        data: '123',
      });
      it('should handle normal input element', () => {
        const textInput = document.createElement('input');
        document.body.append(textInput);
        textInput.dispatchEvent(inputEvent);

        jest.runAllTimers();
        expect(emitSpy).not.toBeCalled();

        observer.start();
        textInput.dispatchEvent(inputEvent);
        const count = emitSpy.calls.count();
        expect(count).toEqual(2);
        expect(emitSpy.calls.first().args[0]).toEqual(
          expect.objectContaining({
            type: 'TEXT_INPUT',
            data: inputEvent.data,
          }),
        );
        expect(emitSpy.calls.mostRecent().args[0]).toEqual(
          expect.objectContaining({
            type: 'TEXT_CHANGE',
            value: textInput.value,
          }),
        );
      });

      it('should handle checkbox input element', () => {
        const checkboxInput = document.createElement('input');
        checkboxInput.setAttribute('type', 'checkbox');
        document.body.append(checkboxInput);

        observer.start();
        checkboxInput.dispatchEvent(inputEvent);
        const count = emitSpy.calls.count();
        expect(count).toBe(1);
        expect(emitSpy.calls.mostRecent().args[0]).toEqual(
          expect.objectContaining({
            type: 'TEXT_INPUT',
            data: inputEvent.data,
          }),
        );
      });

      it('should handle radio input element', () => {
        const radioInput = document.createElement('input');
        radioInput.setAttribute('type', 'radio');
        document.body.append(radioInput);
        observer.start();

        radioInput.dispatchEvent(inputEvent);
        const count = emitSpy.calls.count();
        expect(count).toBe(1);
        expect(emitSpy.calls.mostRecent().args[0]).toEqual(
          expect.objectContaining({
            type: 'TEXT_INPUT',
            data: inputEvent.data,
          }),
        );
      });

      it('should handle editablecontent element', () => {
        const editableContent = document.createElement('div');
        editableContent.contentEditable = 'true';
        document.body.append(editableContent);
        observer.start();
        editableContent.dispatchEvent(inputEvent);

        const count = emitSpy.calls.count();
        expect(count).toEqual(2);
        expect(emitSpy.calls.first().args[0]).toEqual(
          expect.objectContaining({
            type: 'TEXT_INPUT',
            data: inputEvent.data,
          }),
        );
        expect(emitSpy.calls.mostRecent().args[0]).toEqual(
          expect.objectContaining({
            type: 'TEXT_CHANGE',
            value: editableContent.innerHTML,
          }),
        );
      });

      it('should handle non-editablecontent element', () => {
        const unEditableContent = document.createElement('div');
        unEditableContent.contentEditable = 'false';
        document.body.append(unEditableContent);
        observer.start();
        unEditableContent.dispatchEvent(inputEvent);

        const count = emitSpy.calls.count();
        expect(count).toEqual(1);
        expect(emitSpy.calls.mostRecent().args[0]).toEqual(
          expect.objectContaining({
            type: 'TEXT_INPUT',
            data: inputEvent.data,
          }),
        );
      });
    });

    it('should observe before unload', () => {
      const beforeunload = new Event('beforeunload');

      document.dispatchEvent(beforeunload);
      jest.runAllTimers();
      expect(emitSpy).not.toBeCalled();

      observer.start();
      document.dispatchEvent(beforeunload);
      jest.runAllTimers();
      expect(emitSpy.calls.mostRecent().args[0]).toEqual(
        expect.objectContaining({
          type: 'BEFORE_UNLOAD',
        }),
      );
    });

    it('should observe blur', () => {
      const blur = new Event('blur');

      document.dispatchEvent(blur);
      jest.runAllTimers();
      expect(emitSpy).not.toBeCalled();

      observer.start();
      document.dispatchEvent(blur);
      jest.runAllTimers();
      expect(emitSpy.calls.mostRecent().args[0]).toEqual(
        expect.objectContaining({
          type: 'BLUR',
        }),
      );
    });

    describe('observe wheel', () => {
      let container: any;
      let child: any;
      beforeEach(() => {
        // jsdom has no scrollHeight and clientHeight;
        Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
          configurable: true,
          get: function () {
            return this._scrollHeight;
          },
          set: function (val) {
            this._scrollHeight = val;
          },
        });
        Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
          configurable: true,
          get: function () {
            return this._scrollWidth;
          },
          set: function (val) {
            this._scrollWidth = val;
          },
        });
        Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
          configurable: true,
          get: function () {
            return this._clientHeight;
          },
          set: function (val) {
            this._clientHeight = val;
          },
        });
        Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
          configurable: true,
          get: function () {
            return this._clientWidth;
          },
          set: function (val) {
            this._clientWidth = val;
          },
        });
        container = document.createElement('div');
        container.scrollWidth = container.scrollHeight = 1000;
        container.clientWidth = container.clientHeight = 100;
        child = document.createElement('div');
        child.scrollWidth = child.scrollHeight = 1000;
        child.clientWidth = child.clientHeight = 1000;
        container.appendChild(child);
        document.body.appendChild(container);
      });

      it('should not handle event when observer is not start', () => {
        const vertical = new WheelEvent('wheel', {
          deltaY: 100,
        });

        container.dispatchEvent(vertical);
        jest.runAllTimers();
        expect(emitSpy).not.toBeCalled();
      });

      it('should handle vertical wheel event', () => {
        const vertical = new WheelEvent('wheel', {
          deltaY: 100,
        });

        observer.start();

        container.dispatchEvent(vertical);
        jest.runAllTimers();
        const recentArgs = emitSpy.calls.mostRecent().args;
        expect(recentArgs[0]).toEqual(
          expect.objectContaining({
            type: 'WHEEL',
          }),
        );
        expect(recentArgs[1]).toEqual(container);
      });

      it('should handle horizontal wheel event', () => {
        const horizontal = new WheelEvent('wheel', {
          deltaX: 100,
        });

        observer.start();

        container.dispatchEvent(horizontal);
        jest.runAllTimers();
        const recentArgs = emitSpy.calls.mostRecent().args;
        expect(recentArgs[0]).toEqual(
          expect.objectContaining({
            type: 'WHEEL',
          }),
        );
        expect(recentArgs[1]).toEqual(container);
      });

      it('should get correct scrolling element', () => {
        const verticalWheel = new WheelEvent('wheel', {
          deltaY: 100,
        });

        observer.start();
        child.dispatchEvent(verticalWheel);
        jest.runAllTimers();
        const recentArgs = emitSpy.calls.mostRecent().args;
        expect(recentArgs[0]).toEqual(
          expect.objectContaining({
            type: 'WHEEL',
          }),
        );
        expect(recentArgs[1]).toEqual(container);
      });

      it('should ignore non-scroll wheel', () => {
        const nonScroll = document.createElement('div');
        document.head.appendChild(nonScroll);
        const verticalWheel = new WheelEvent('wheel', {
          deltaY: 100,
        });

        observer.start();

        nonScroll.dispatchEvent(verticalWheel);
        jest.runAllTimers();
        expect(emitSpy).not.toBeCalled();
      });
    });

    afterAll(() => {
      jest.useRealTimers();
    });
  });
});
