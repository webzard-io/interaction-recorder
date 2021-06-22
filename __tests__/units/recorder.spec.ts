import { IMatcher, IObserver, Recorder, MatcherKey } from '../../src/index';
import { getMockedMatcher, getMockedObserver } from '../util/mock';

let recorder: Recorder;
let matcher: IMatcher;
let observer: IObserver;

describe('Recorder', () => {
  beforeEach(() => {
    matcher = getMockedMatcher();
    recorder = new Recorder({
      matcher,
      onEmit: () => void 0,
    });
  });
  it('should create a recorder instance', () => {
    expect(recorder).not.toBeFalsy();
  });

  it('should handle state', () => {
    // the initial state should be inactive;
    expect(recorder.state).toBe('inactive');

    const startSpy = spyOn(matcher, 'start');
    const stopSpy = spyOn(matcher, 'stop');
    const suspendSpy = spyOn(matcher, 'suspend');

    recorder.start();
    expect(startSpy).toBeCalled();
    expect(recorder.state).toBe('active');

    recorder.suspend();
    expect(suspendSpy).toBeCalled();
    expect(recorder.state).toBe('suspend');

    recorder.stop();
    expect(stopSpy).toBeCalled();
    expect(recorder.state).toBe('inactive');
  });

  it('should emit event', async () => {
    const emitSpy = spyOn<any>(recorder, 'emitCurrentStep').and.callThrough();
    const onEmitSpy = spyOn<any>(recorder, 'onEmit').and.callThrough();
    // normal action
    await matcher.emitter.emitAsync(
      MatcherKey.EMIT,
      'ACTION',
      [],
      document.createElement('div'),
    );
    expect(emitSpy).toBeCalled();
    expect(onEmitSpy).toBeCalled();
    // unknown action
    await matcher.emitter.emitAsync(
      MatcherKey.EMIT,
      'UNKNOWN',
      [],
      document.createElement('div'),
    );
    expect(emitSpy).toBeCalledTimes(2);
    expect(onEmitSpy).toBeCalledTimes(1);
    // null target
    let error: Error;
    try {
      await matcher.emitter.emitAsync(MatcherKey.EMIT, 'ANYTHING', [], null);
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeFalsy();
    expect(emitSpy).toBeCalledTimes(3);
    expect(onEmitSpy).toBeCalledTimes(1);
  });

  it('should extend action', () => {
    const observer1 = getMockedObserver();
    recorder.extendAction({ observer: observer1 });
    expect(recorder['observersList'].length).toBe(1);
    expect(recorder['listenerMap'].has(observer1)).toBeTruthy();
    // the same observer should not be extend twice;
    recorder.extendAction({ observer: observer1 });
    expect(recorder['observersList'].length).toBe(1);
    expect(recorder['listenerMap'].has(observer1)).toBeTruthy();

    // observer should not be extended when recorder is active
    recorder.start();
    const observer2 = getMockedObserver();
    recorder.extendAction({ observer: observer2 });
    expect(recorder['observersList'].length).toBe(1);
    expect(recorder['listenerMap'].has(observer2)).toBeFalsy();

    // observer could be extended when recorder is suspend
    recorder.suspend();
    recorder.extendAction({ observer: observer2 });
    expect(recorder['observersList'].length).toBe(2);
    expect(recorder['listenerMap'].has(observer2)).toBeTruthy();
  });

  describe('after extend action', () => {
    beforeEach(() => {
      observer = getMockedObserver();
      recorder.extendAction({
        observer,
      });
    });

    it('should control state of observer', () => {
      const startSpy = spyOn(observer, 'start');
      const stopSpy = spyOn(observer, 'stop');
      const suspendSpy = spyOn(observer, 'suspend');

      recorder.start();
      expect(startSpy).toBeCalled();

      recorder.suspend();
      expect(suspendSpy).toBeCalled();

      recorder.stop();
      expect(stopSpy).toBeCalled();
    });

    it('should remove the action', () => {
      const removeActionSpy = spyOn(matcher, 'removeAction').and.callThrough();
      // observer should not be removed when not extended
      const observer1 = getMockedObserver();
      recorder.removeAction(observer1);
      expect(removeActionSpy).toBeCalled();
      removeActionSpy.calls.reset();
      expect(recorder['observersList'].length).toBe(1);
      expect(recorder['listenerMap'].has(observer1)).toBeFalsy();

      // observer should not be removed when recorder is active
      recorder.start();
      recorder.removeAction(observer);
      expect(removeActionSpy).not.toBeCalled();
      removeActionSpy.calls.reset();
      expect(recorder['observersList'].length).toBe(1);
      expect(recorder['listenerMap'].has(observer)).toBeTruthy();

      // observer should be removed when recorder is inactive
      recorder.stop();
      recorder.removeAction(observer);
      expect(removeActionSpy).toBeCalled();
      expect(recorder['observersList'].length).toBe(0);
      expect(recorder['listenerMap'].has(observer)).toBeFalsy();
    });

    it('should emit event to matcher when observer emit an event', () => {
      const emitSpy = spyOn(
        recorder['matcher']['emitter'],
        'emit',
      ).and.callFake(() => void 0);
      observer.emitter.emit(`observer.${observer.name}`);
      expect(emitSpy).toBeCalled();
    });
    afterEach(() => {
      observer = undefined;
    });
  });

  afterEach(() => {
    recorder = undefined;
  });
});
