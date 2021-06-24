import {
  MatcherKey,
  PatternMatcher,
  InteractionRecorder,
  StepEvent,
  EmitAction,
  CollectAction,
} from '../../src/index';
let recorder: InteractionRecorder;
describe('Interaction recorder', () => {
  let listenner: jest.Mock<any, any>;
  beforeEach(() => {
    listenner = jest.fn();
    recorder = new InteractionRecorder(window, { onEmit: listenner });
  });
  it('should create an instance', () => {
    expect(recorder).not.toBeFalsy();
  });

  it('should start', () => {
    recorder.start();
    expect(recorder.observer['state']).toBe('active');
    expect(recorder.recorder.state).toBe('active');
    expect(recorder.recorder['matcher']['state']).toBe('active');
  });

  it('should suspend', () => {
    recorder.start();
    recorder.suspend();
    expect(recorder.observer['state']).toBe('suspend');
    expect(recorder.recorder.state).toBe('suspend');
    expect(recorder.recorder['matcher']['state']).toBe('suspend');
  });

  it('should stop', () => {
    recorder.start();
    recorder.stop();
    expect(recorder.observer['state']).toBe('inactive');
    expect(recorder.recorder.state).toBe('inactive');
    expect(recorder.recorder['matcher']['state']).toBe('inactive');
  });

  it('should able to get observer', () => {
    expect(recorder.observer).not.toBeFalsy();
  });

  it('should able to get recorder', () => {
    expect(recorder.recorder).not.toBeFalsy();
  });

  describe('action before collect step', () => {
    let emitSpy: jasmine.Spy;
    let matcher: PatternMatcher;
    beforeAll(() => {
      jest.useFakeTimers();
    });
    beforeEach(() => {
      recorder.start();
      emitSpy = spyOn<any>(
        recorder['_recorder']['matcher'],
        'handleNewEvent',
      ).and.callFake(function (
        stepEvent: StepEvent,
        target: HTMLElement | null,
      ) {
        for (const [, handler] of this.actionBeforeCollectStep) {
          const result = handler && handler(this, stepEvent, target);
          if (result) {
            return result;
          }
        }
      });
      matcher = recorder['_recorder']['matcher'] as PatternMatcher;
    });

    it('should process event', () => {
      const target = document.createElement('div');
      matcher.currentEvents = [{ type: 'BLUR', timestamp: 0 }];
      matcher.emitter.emit(MatcherKey.NEW_EVENT, { type: 'MOUSEUP' }, target);
      jest.runAllTimers();

      expect(emitSpy.calls.mostRecent().returnValue).toBe(EmitAction.CONTINUE);
    });

    it('should process event when no previous events', () => {
      const target = document.createElement('div');
      matcher.emitter.emit(MatcherKey.NEW_EVENT, { type: 'MOUSEUP' }, target);
      jest.runAllTimers();

      expect(emitSpy.calls.mostRecent().returnValue).toBe(EmitAction.CONTINUE);
    });

    it('should return when scroll target changed', () => {
      const prevTarget = document.createElement('div');
      const currentTarget = document.createElement('div');
      matcher.currentEvents = [];
      matcher.currentTarget = prevTarget;
      matcher.emitter.emit(
        MatcherKey.NEW_EVENT,
        { type: 'SCROLL' },
        currentTarget,
      );
      jest.runAllTimers();

      expect(emitSpy.calls.mostRecent().returnValue).toEqual(EmitAction.RETURN);
    });

    it('should return when get extra wheel event on the same target', () => {
      const target = document.createElement('div');
      matcher.currentEvents = [{ type: 'WHEEL', timestamp: 0 }];
      matcher.currentTarget = target;
      matcher.emitter.emit(MatcherKey.NEW_EVENT, { type: 'WHEEL' }, target);
      jest.runAllTimers();

      expect(emitSpy.calls.mostRecent().returnValue).toEqual(EmitAction.RETURN);
    });

    describe('should emit new one', () => {
      it('when mousedown', () => {
        const target = document.createElement('div');
        matcher.currentEvents = [{ type: 'WHEEL', timestamp: -1 }];
        matcher.emitter.emit(
          MatcherKey.NEW_EVENT,
          { type: 'MOUSEDOWN' },
          target,
        );
        jest.runAllTimers();

        expect(emitSpy.calls.mostRecent().returnValue).toEqual(EmitAction.EMIT);
      });

      it('when new wheel event of different target', () => {
        const target = document.createElement('div');
        const nextTarget = document.createElement('div');
        matcher.currentTarget = target;
        matcher.currentEvents = [{ type: 'WHEEL', timestamp: -1 }];
        matcher.emitter.emit(
          MatcherKey.NEW_EVENT,
          { type: 'WHEEL' },
          nextTarget,
        );
        jest.runAllTimers();

        expect(emitSpy.calls.mostRecent().returnValue).toEqual(EmitAction.EMIT);
      });

      // page reload seems not collect by observer, why we have a matcher here.
      // () => {
      //   matcher.emitter.emit(
      //     MatcherKey.NEW_EVENT,
      //     { type: 'BEFORE_UNLOAD' },
      //     document,
      //   );
      //   jest.runAllTimers();
      //   expect(emitSpy.calls.mostRecent().returnValue).toEqual(EmitAction.EMIT);
      // }
      it.todo('when page reload');

      it('when blur after text input event', () => {
        matcher.currentEvents = [
          { type: 'TEXT_INPUT', timestamp: 0, data: '', value: '' },
        ];
        matcher.emitter.emit(MatcherKey.NEW_EVENT, { type: 'BLUR' }, document);
        jest.runAllTimers();
        expect(emitSpy.calls.mostRecent().returnValue).toEqual(EmitAction.EMIT);
      });

      it('when blur after text change event', () => {
        matcher.currentEvents = [
          { type: 'TEXT_CHANGE', timestamp: 0, value: '' },
        ];
        matcher.emitter.emit(MatcherKey.NEW_EVENT, { type: 'BLUR' }, document);
        jest.runAllTimers();
        expect(emitSpy.calls.mostRecent().returnValue).toEqual(EmitAction.EMIT);
      });

      it('when keydown after non-keyevent(not continuous typing)', () => {
        matcher.currentEvents = [{ type: 'BLUR', timestamp: 0 }];
        matcher.emitter.emit(
          MatcherKey.NEW_EVENT,
          { type: 'KEYDOWN' },
          document,
        );
        jest.runAllTimers();
        expect(emitSpy.calls.mostRecent().returnValue).toEqual(EmitAction.EMIT);
      });
    });

    afterEach(() => {
      emitSpy.calls.reset();
    });

    afterAll(() => {
      jest.useRealTimers();
    });
  });

  describe('action while collect step', () => {
    let emitSpy: jasmine.Spy;
    let matcher: PatternMatcher;
    beforeAll(() => {
      jest.useFakeTimers();
    });
    beforeEach(() => {
      recorder.start();
      emitSpy = spyOn<any>(
        recorder['_recorder']['matcher'],
        'handleNewEvent',
      ).and.callFake(function (
        stepEvent: StepEvent,
        target: HTMLElement | null,
      ) {
        for (const [, handler] of this.actionWhileCollectStep) {
          const result = handler && handler(this, stepEvent, target);
          if (result) {
            return result;
          }
        }
      });
      matcher = recorder['_recorder']['matcher'] as PatternMatcher;
    });

    it('should prcoess when drag mouse move', () => {
      matcher.currentEvents = [
        {
          type: 'MOUSEDOWN',
          timestamp: 0,
          clientY: 0,
          clientX: 0,
          modifiers: {},
        },
        {
          type: 'MOUSEMOVE',
          timestamp: 1,
          positions: [],
        },
      ];
      matcher.emitter.emit(
        MatcherKey.NEW_EVENT,
        { type: 'MOUSEMOVE', timestamp: 2 },
        document,
      );

      jest.runAllTimers();
      expect(emitSpy.calls.mostRecent().returnValue).toEqual(
        CollectAction.COLLECT,
      );
    });

    it('should not prcoess mousemove as the first event of event group', () => {
      matcher.emitter.emit(
        MatcherKey.NEW_EVENT,
        { type: 'MOUSEMOVE', timestamps: 1 },
        document,
      );
      jest.runAllTimers();
      expect(emitSpy.calls.mostRecent().returnValue).toEqual(EmitAction.RETURN);
    });

    it('should not prcoess when drag mouse move', () => {
      matcher.currentEvents = [
        {
          type: 'MOUSEUP',
          timestamp: 0,
          clientY: 0,
          clientX: 0,
          modifiers: {},
        },
      ];
      matcher.emitter.emit(
        MatcherKey.NEW_EVENT,
        { type: 'MOUSEMOVE', timestamps: 1 },
        document,
      );
      jest.runAllTimers();
      expect(emitSpy.calls.mostRecent().returnValue).toEqual(EmitAction.RETURN);
    });

    it('should collect when need collect', () => {
      matcher.emitter.emit(
        MatcherKey.NEW_EVENT,
        { type: 'CLICK', timestamps: 1 },
        document,
      );
      jest.runAllTimers();
      expect(emitSpy.calls.mostRecent().returnValue).toEqual(
        CollectAction.COLLECT,
      );
    });

    it('should not collect blur or before unload', () => {
      matcher.emitter.emit(
        MatcherKey.NEW_EVENT,
        { type: 'BLUR', timestamps: 1 },
        document,
      );
      jest.runAllTimers();
      expect(emitSpy.calls.mostRecent().returnValue).toBe(
        CollectAction.CONTINUE,
      );

      matcher.emitter.emit(
        MatcherKey.NEW_EVENT,
        { type: 'BEFORE_UNLOAD', timestamps: 1 },
        document,
      );
      jest.runAllTimers();
      expect(emitSpy.calls.mostRecent().returnValue).toBe(
        CollectAction.CONTINUE,
      );
    });

    afterEach(() => {
      emitSpy.calls.reset();
    });

    afterAll(() => {
      jest.useRealTimers();
    });
  });

  describe('action after collect step', () => {
    let emitSpy: jasmine.Spy;
    let matcher: PatternMatcher;
    beforeAll(() => {
      jest.useFakeTimers();
    });
    beforeEach(() => {
      recorder.start();
      emitSpy = spyOn<any>(
        recorder['_recorder']['matcher'],
        'handleNewEvent',
      ).and.callFake(function (
        stepEvent: StepEvent,
        target: HTMLElement | null,
      ) {
        for (const [, handler] of this.actionAfterCollectStep) {
          const result = handler && handler(this, stepEvent, target);
          if (result) {
            return result;
          }
        }
      });
      matcher = recorder['_recorder']['matcher'] as PatternMatcher;
    });

    it('should not emit when no events collected', () => {
      matcher.currentEvents = [];
      matcher.emitter.emit(MatcherKey.NEW_EVENT);
      jest.runAllTimers();
      expect(emitSpy.calls.mostRecent().returnValue).toBe(EmitAction.CONTINUE);
    });

    it('should emit when last event is click', () => {
      matcher.currentEvents = [
        {
          type: 'CLICK',
          timestamp: 0,
          clientX: 0,
          clientY: 0,
          modifiers: {},
        },
      ];
      matcher.emitter.emit(MatcherKey.NEW_EVENT);
      jest.runAllTimers();
      expect(emitSpy.calls.mostRecent().returnValue).toEqual(EmitAction.EMIT);
    });

    it('should emit when get a middle button scroll event', () => {
      matcher.currentEvents = [
        {
          type: 'MOUSEDOWN',
          timestamp: 0,
          clientX: 0,
          clientY: 0,
          modifiers: {},
        },
        {
          type: 'SCROLL',
          timestamp: 0,
          scrollLeft: 0,
          scrollTop: 0,
        },
        {
          type: 'SCROLL',
          timestamp: 0,
          scrollLeft: 0,
          scrollTop: 0,
        },
        {
          type: 'MOUSEUP',
          timestamp: 0,
          clientX: 0,
          clientY: 0,
          modifiers: {},
        },
      ];
      matcher.emitter.emit(MatcherKey.NEW_EVENT);
      jest.runAllTimers();
      expect(emitSpy.calls.mostRecent().returnValue).toEqual(EmitAction.EMIT);
    });

    it('should not emit for other event', () => {
      matcher.currentEvents = [
        {
          type: 'MOUSEDOWN',
          timestamp: 0,
          clientX: 0,
          clientY: 0,
          modifiers: {},
        },
      ];
      matcher.emitter.emit(MatcherKey.NEW_EVENT);
      jest.runAllTimers();
      expect(emitSpy.calls.mostRecent().returnValue).toBe(EmitAction.CONTINUE);
    });

    afterEach(() => {
      emitSpy.calls.reset();
    });

    afterAll(() => {
      jest.useRealTimers();
    });
  });

  describe('match pattern', () => {
    let matcher: PatternMatcher;
    beforeAll(() => {
      jest.useFakeTimers();
    });
    beforeEach(() => {
      recorder.start();
      spyOn<any>(
        recorder['_recorder']['matcher'],
        'handleNewEvent',
      ).and.callFake(function () {
        this.emitCurrentStep();
      });
      matcher = recorder['_recorder']['matcher'] as PatternMatcher;
    });

    it('should throw error when get empty events', () => {
      try {
        matcher.emitter.emit(MatcherKey.NEW_EVENT);
        jest.runAllTimers();
      } catch (error) {
        expect(error).not.toBeUndefined();
      }
      expect.assertions(1);
    });

    it('should emit click event', () => {
      const target = document.createElement('div');
      matcher.currentTarget = target;
      matcher.currentEvents = [
        {
          type: 'MOUSEDOWN',
          clientY: 0,
          clientX: 0,
          timestamp: 0,
          modifiers: {},
        },
        {
          type: 'MOUSEUP',
          clientY: 0,
          clientX: 0,
          timestamp: 0,
          modifiers: {},
        },
        {
          type: 'CLICK',
          clientY: 0,
          clientX: 0,
          timestamp: 0,
          modifiers: {},
        },
      ];
      matcher.emitter.emit(MatcherKey.NEW_EVENT);
      jest.runAllTimers();
      expect(listenner.mock.calls.slice(-1)[0][0]).toEqual(
        expect.objectContaining({
          action: 'CLICK',
        }),
      );
      matcher.currentTarget = target;
      matcher.currentEvents = [
        {
          type: 'CLICK',
          clientY: 0,
          clientX: 0,
          timestamp: 0,
          modifiers: {},
        },
      ];
      matcher.emitter.emit(MatcherKey.NEW_EVENT);
      jest.runAllTimers();
      expect(listenner.mock.calls.slice(-1)[0][0]).toEqual(
        expect.objectContaining({
          action: 'CLICK',
        }),
      );
    });

    it('should emit drag event', () => {
      const target = document.createElement('div');
      matcher.currentTarget = target;
      matcher.currentEvents = [
        {
          type: 'MOUSEDOWN',
          clientY: 0,
          clientX: 0,
          timestamp: 0,
          modifiers: {},
        },
        {
          type: 'MOUSEMOVE',
          timestamp: 0,
          positions: [],
        },
        {
          type: 'MOUSEMOVE',
          timestamp: 0,
          positions: [],
        },
        {
          type: 'MOUSEUP',
          clientY: 0,
          clientX: 0,
          timestamp: 0,
          modifiers: {},
        },
        {
          type: 'CLICK',
          clientY: 0,
          clientX: 0,
          timestamp: 0,
          modifiers: {},
        },
      ];
      matcher.emitter.emit(MatcherKey.NEW_EVENT);
      jest.runAllTimers();
      expect(listenner.mock.calls.slice(-1)[0][0]).toEqual(
        expect.objectContaining({
          action: 'DRAG',
        }),
      );
    });

    describe('scroll event', () => {
      it('should emit wheel scroll', () => {
        const target = document.createElement('div');
        matcher.currentTarget = target;
        matcher.currentEvents = [
          {
            type: 'WHEEL',
            timestamp: 0,
          },
          {
            type: 'SCROLL',
            timestamp: 0,
            scrollLeft: 0,
            scrollTop: 0,
          },
          {
            type: 'SCROLL',
            timestamp: 0,
            scrollLeft: 0,
            scrollTop: 0,
          },
          {
            type: 'SCROLL',
            timestamp: 0,
            scrollLeft: 0,
            scrollTop: 0,
          },
        ];
        matcher.emitter.emit(MatcherKey.NEW_EVENT);
        jest.runAllTimers();
        expect(listenner.mock.calls.slice(-1)[0][0]).toEqual(
          expect.objectContaining({
            action: 'SCROLL',
          }),
        );
      });

      it('should emit scrollbar scroll event', () => {
        const target = document.createElement('div');
        matcher.currentTarget = target;
        matcher.currentEvents = [
          {
            type: 'MOUSEDOWN',
            clientY: 0,
            clientX: 0,
            timestamp: 0,
            modifiers: {},
          },
          {
            type: 'SCROLL',
            timestamp: 0,
            scrollLeft: 0,
            scrollTop: 0,
          },
          {
            type: 'SCROLL',
            timestamp: 0,
            scrollLeft: 0,
            scrollTop: 0,
          },
          {
            type: 'SCROLL',
            timestamp: 0,
            scrollLeft: 0,
            scrollTop: 0,
          },
          {
            type: 'MOUSEUP',
            clientY: 0,
            clientX: 0,
            timestamp: 0,
            modifiers: {},
          },
        ];
        matcher.emitter.emit(MatcherKey.NEW_EVENT);
        jest.runAllTimers();
        expect(listenner.mock.calls.slice(-1)[0][0]).toEqual(
          expect.objectContaining({
            action: 'SCROLL',
          }),
        );
      });
    });

    it('should emit text step', () => {
      const target = document.createElement('div');
      matcher.currentTarget = target;
      matcher.currentEvents = [
        {
          type: 'KEYDOWN',
          key: '',
          code: '',
          keyCode: 0,
          modifiers: {},
          timestamp: 0,
        },
        {
          type: 'KEYPRESS',
          key: '',
          code: '',
          keyCode: 0,
          modifiers: {},
          timestamp: 0,
        },
        {
          type: 'KEYUP',
          key: '',
          code: '',
          keyCode: 0,
          modifiers: {},
          timestamp: 0,
        },
      ];
      matcher.emitter.emit(MatcherKey.NEW_EVENT);
      jest.runAllTimers();
      expect(listenner.mock.calls.slice(-1)[0][0]).toEqual(
        expect.objectContaining({
          action: 'TEXT',
        }),
      );
    });

    it('should emit unknown step', () => {
      const target = document.createElement('div');
      matcher.currentTarget = target;
      matcher.currentEvents = [
        {
          type: 'BLUR',
          timestamp: 0,
        },
        {
          type: 'BEFORE_UNLOAD',
          timestamp: 0,
        },
      ];
      matcher.emitter.emit(MatcherKey.NEW_EVENT);
      jest.runAllTimers();
      expect(listenner).not.toBeCalled();
    });

    afterEach(() => {
      matcher = undefined;
      listenner.mockRestore();
    });

    afterAll(() => {
      jest.useRealTimers();
    });
  });
});
