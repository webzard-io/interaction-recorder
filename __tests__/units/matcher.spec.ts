import { EventEmitter2 } from 'eventemitter2';
import {
  PatternMatcher,
  PatternMatcherExtendParams,
  MatcherKey,
  StepEvent,
  Step,
  EmitAction,
  CollectAction,
} from '../../src/index';
import { getMockedObserver } from '../util/mock';
let matcher: PatternMatcher;

const buildParams = (
  pattern?: Step['action'] | 'UNKNOWN',
  options: {
    actionBeforeCollectStep?: EmitAction;
    actionWhileCollectStep?: CollectAction;
    actionAfterCollectStep?: EmitAction;
  } = {},
): PatternMatcherExtendParams => {
  const observer = getMockedObserver();
  const {
    actionBeforeCollectStep,
    actionWhileCollectStep,
    actionAfterCollectStep,
  } = options;
  return {
    observer,
    pattern: () => pattern,
    actionBeforeCollectStep: () => actionBeforeCollectStep,
    actionWhileCollectStep: () => actionWhileCollectStep,
    actionAfterCollectStep: () => actionAfterCollectStep,
  };
};

describe('PatternMatcher', () => {
  beforeEach(() => {
    matcher = new PatternMatcher();
  });

  it('should create a pattern matcher instance', () => {
    expect(matcher).not.toBeFalsy();
  });

  it('should handle state', () => {
    // the initial state should be inactive;
    expect(matcher['state']).toBe('inactive');

    // inactive -> active: active
    matcher.start();
    expect(matcher['state']).toBe('active');

    // active -> suspend: suspend
    matcher.suspend();
    expect(matcher['state']).toBe('suspend');

    // suspend -> active: active;
    matcher.start();
    expect(matcher['state']).toBe('active');

    // active -> inactive: inactive
    matcher.stop();
    expect(matcher['state']).toBe('inactive');

    // inactive -> suspend: inactive
    matcher.suspend();
    expect(matcher['state']).toBe('inactive');

    // suspend -> inactive: inactive
    matcher.start();
    matcher.suspend();
    matcher.stop();
    expect(matcher['state']).toBe('inactive');
  });

  it('should extend action', () => {
    const params = buildParams('UNKNOWN');
    const { observer } = params;
    params.pattern = jest.fn();
    params.actionAfterCollectStep = jest.fn();
    params.actionBeforeCollectStep = jest.fn();
    params.actionWhileCollectStep = jest.fn();
    matcher.extendAction(params);

    expect(matcher['actionAfterCollectStep'].has(observer)).toBeTruthy();
    expect(matcher['actionBeforeCollectStep'].has(observer)).toBeTruthy();
    expect(matcher['actionWhileCollectStep'].has(observer)).toBeTruthy();
    expect(matcher['patternMatcher'].has(observer)).toBeTruthy();
  });

  it('should remove action', () => {
    const params = buildParams('UNKNOWN');
    const { observer } = params;
    matcher.extendAction(params);

    matcher.removeAction(observer);
  });

  describe('handle event', () => {
    beforeEach(() => {
      matcher.emitter = new EventEmitter2();
    });

    it('should handle "return" of actionBeforeCollectStep', async () => {
      const collectSpy = jest.spyOn<any, any>(matcher, 'collectEvent');
      const emitSpy = jest.spyOn<any, any>(matcher, 'emitCurrentStep');
      const params = buildParams('UNKNOWN', {
        actionBeforeCollectStep: EmitAction.RETURN,
        actionWhileCollectStep: CollectAction.COLLECT,
        actionAfterCollectStep: EmitAction.EMIT,
      });

      matcher.extendAction(params);
      matcher.start();

      const stepEvent = {} as StepEvent;
      const ele = {} as HTMLElement;
      await matcher.emitter.emitAsync(MatcherKey.NEW_EVENT, stepEvent, ele);
      expect(collectSpy).not.toBeCalled();
      expect(emitSpy).not.toBeCalled();
    });

    it('should handle "emit" of actionBeforeCollectStep', async () => {
      const emitSpy = jest.spyOn<any, any>(matcher, 'emitCurrentStep');
      const collectSpy = jest.spyOn<any, any>(matcher, 'collectEvent');
      const params = buildParams('UNKNOWN', {
        actionBeforeCollectStep: EmitAction.EMIT,
        actionWhileCollectStep: CollectAction.COLLECT,
      });

      matcher.extendAction(params);
      matcher.start();

      const stepEvent = {} as StepEvent;
      const ele = {} as HTMLElement;
      await matcher.emitter.emitAsync(MatcherKey.NEW_EVENT, stepEvent, ele);
      expect(collectSpy.mock.invocationCallOrder[0]).toBeGreaterThan(
        emitSpy.mock.invocationCallOrder[0],
      );
      expect(collectSpy).toBeCalled();
      expect(emitSpy).toBeCalled();
    });

    it('should handle undefined of actionBeforeCollectStep', async () => {
      const collectSpy = jest.spyOn<any, any>(matcher, 'collectEvent');
      const emitSpy = jest.spyOn<any, any>(matcher, 'emitCurrentStep');
      const params = buildParams('UNKNOWN', {
        actionWhileCollectStep: CollectAction.COLLECT,
        actionAfterCollectStep: EmitAction.EMIT,
      });

      matcher.extendAction(params);
      matcher.start();

      const stepEvent = {} as StepEvent;
      const ele = {} as HTMLElement;
      await matcher.emitter.emitAsync(MatcherKey.NEW_EVENT, stepEvent, ele);
      expect(collectSpy.mock.invocationCallOrder[0]).toBeLessThan(
        emitSpy.mock.invocationCallOrder[0],
      );
      expect(collectSpy).toBeCalled();
      expect(emitSpy).toBeCalled();
    });

    it('should handle "return" of actionWhileCollectStep', async () => {
      const collectSpy = jest.spyOn<any, any>(matcher, 'collectEvent');
      const emitSpy = jest.spyOn<any, any>(matcher, 'emitCurrentStep');
      const params = buildParams('UNKNOWN', {
        actionWhileCollectStep: CollectAction.RETURN,
        actionAfterCollectStep: EmitAction.EMIT,
      });

      matcher.extendAction(params);
      matcher.start();

      const stepEvent = {} as StepEvent;
      const ele = {} as HTMLElement;
      await matcher.emitter.emitAsync(MatcherKey.NEW_EVENT, stepEvent, ele);
      expect(collectSpy).not.toBeCalled();
      expect(emitSpy).not.toBeCalled();
    });

    it('should handle "collect" of actionWhileCollectStep', async () => {
      const collectSpy = jest.spyOn<any, any>(matcher, 'collectEvent');
      const params = buildParams('UNKNOWN', {
        actionWhileCollectStep: CollectAction.COLLECT,
      });

      matcher.extendAction(params);
      matcher.start();

      const stepEvent = {} as StepEvent;
      const ele = {} as HTMLElement;
      await matcher.emitter.emitAsync(MatcherKey.NEW_EVENT, stepEvent, ele);
      expect(collectSpy).toBeCalled();
      expect(matcher.currentEvents).toHaveLength(1);
      expect(matcher.currentTarget).toBe(ele);
      expect(matcher.currentEvents[0]).toBe(stepEvent);
    });

    it('should handle undefined of actionWhileCollectStep', async () => {
      const collectSpy = jest.spyOn<any, any>(matcher, 'collectEvent');
      const params = buildParams('UNKNOWN');

      matcher.extendAction(params);
      matcher.start();

      const stepEvent = {} as StepEvent;
      const ele = {} as HTMLElement;
      await matcher.emitter.emitAsync(MatcherKey.NEW_EVENT, stepEvent, ele);
      expect(collectSpy).not.toBeCalled();
    });

    it('should handle "return" of actionAfterCollectStep', async () => {
      const emitSpy = jest.spyOn<any, any>(matcher, 'emitCurrentStep');
      const params = buildParams('UNKNOWN', {
        actionAfterCollectStep: EmitAction.RETURN,
      });

      matcher.extendAction(params);
      matcher.start();

      const stepEvent = {} as StepEvent;
      const ele = {} as HTMLElement;
      await matcher.emitter.emitAsync(MatcherKey.NEW_EVENT, stepEvent, ele);
      expect(emitSpy).not.toBeCalled();
    });

    it('should handle "emit" of actionAfterCollectStep', async () => {
      const emitSpy = jest.spyOn<any, any>(matcher, 'emitCurrentStep');
      const params = buildParams('UNKNOWN', {
        actionAfterCollectStep: EmitAction.EMIT,
      });

      matcher.extendAction(params);
      matcher.start();

      const stepEvent = {} as StepEvent;
      const ele = {} as HTMLElement;
      await matcher.emitter.emitAsync(MatcherKey.NEW_EVENT, stepEvent, ele);
      expect(emitSpy).toBeCalled();
    });

    it('should handle undefined of actionAfterCollectStep', async () => {
      const emitSpy = jest.spyOn<any, any>(matcher, 'emitCurrentStep');
      const params = buildParams('UNKNOWN');

      matcher.extendAction(params);
      matcher.start();

      const stepEvent = {} as StepEvent;
      const ele = {} as HTMLElement;
      await matcher.emitter.emitAsync(MatcherKey.NEW_EVENT, stepEvent, ele);
      expect(emitSpy).not.toBeCalled();
    });
  });

  describe('match pattern', () => {
    beforeEach(() => {
      matcher.emitter = new EventEmitter2();
    });

    it('should return action', async () => {
      const matchSpy = spyOn<any>(matcher, 'matchPattern').and.callThrough();
      const params = buildParams('CLICK', {
        actionBeforeCollectStep: EmitAction.EMIT,
      });
      matcher.extendAction(params);
      matcher.start();

      const stepEvent = {} as StepEvent;
      const ele = {} as HTMLElement;

      await matcher.emitter.emitAsync(MatcherKey.NEW_EVENT, stepEvent, ele);
      expect(matchSpy.calls.mostRecent().returnValue.action).toBe('CLICK');
    });
    it('should return "UNKNOWN" when no action match', async () => {
      const matchSpy = spyOn<any>(matcher, 'matchPattern').and.callThrough();
      const params = buildParams(undefined, {
        actionBeforeCollectStep: EmitAction.EMIT,
      });
      matcher.extendAction(params);
      matcher.start();

      const stepEvent = {} as StepEvent;
      const ele = {} as HTMLElement;
      await matcher.emitter.emitAsync(MatcherKey.NEW_EVENT, stepEvent, ele);

      expect(matchSpy.calls.mostRecent().returnValue.action).toBe('UNKNOWN');
    });
  });
});
