import {
  CollectAction,
  EmitAction,
  PatternMatcher,
  PatternMatcherExtendParams,
} from './matcher';
import { EventObserver } from './observers';
import { Recorder, RecorderOptions } from './recorder';
import { StepEvent, Step } from './types';

export class InteractionRecorder {
  private _observer: EventObserver;
  public get observer(): EventObserver {
    return this._observer;
  }

  private _recorder: Recorder;
  public get recorder(): Recorder {
    return this._recorder;
  }

  constructor(win: Window, options: Omit<RecorderOptions, 'matcher'>) {
    this._observer = new EventObserver(win);

    this._recorder = new Recorder({
      ...options,
      matcher: new PatternMatcher(),
    });

    this._recorder.extendAction<PatternMatcherExtendParams>({
      observer: this._observer,
      pattern: matchPattern,
      actionBeforeCollectStep: this.actionBeforeCollectStep,
      actionWhileCollectStep: this.actionWhileCollectStep,
      actionAfterCollectStep: this.actionAfterCollectStep,
    });
  }

  public start(): void {
    this._recorder.start();
  }

  public suspend(): void {
    this._recorder.suspend();
  }
  public stop(): void {
    this._recorder.stop();
  }

  private actionBeforeCollectStep: PatternMatcherExtendParams['actionBeforeCollectStep'] =
    ({ currentEvents, currentTarget }, newEvent, target) => {
      const isTargetChanged = currentTarget !== target;
      /**
       * according to current implementation a scroll step won't be the first step for any type of event;
       * a scroll event must be started by a wheel or mouseup event share the same target;
       */
      if (newEvent.type === 'SCROLL' && isTargetChanged) {
        /**
         * ignore other scroll steps on other element when there is already a scroll event;
         */
        return EmitAction.RETURN;
      } else if (
        newEvent.type === 'WHEEL' &&
        !isTargetChanged &&
        currentEvents.length &&
        currentEvents[0].type === 'WHEEL'
      ) {
        /**
         * ignore extra wheel event share the same target;
         */
        return EmitAction.RETURN;
      }
      // /**
      if (shouldStartNewOne(currentEvents, newEvent, isTargetChanged)) {
        return EmitAction.EMIT;
      }
      return EmitAction.CONTINUE;
    };

  private actionWhileCollectStep: PatternMatcherExtendParams['actionWhileCollectStep'] =
    ({ currentEvents }, newEvent) => {
      if (
        newEvent.type === 'MOUSEMOVE' &&
        !isDragStep(currentEvents, newEvent)
      ) {
        return CollectAction.RETURN;
      }
      if (needCollect(newEvent)) {
        return CollectAction.COLLECT;
      }
      return CollectAction.CONTINUE;
    };

  private actionAfterCollectStep: PatternMatcherExtendParams['actionAfterCollectStep'] =
    ({ currentEvents }) => {
      if (shouldStopCurrentOne(currentEvents)) {
        return EmitAction.EMIT;
      }
      return EmitAction.CONTINUE;
    };
}

const keyboardSet = new Set([
  'KEYDOWN',
  'KEYPRESS',
  'KEYUP',
  'TEXT_INPUT',
  'TEXT_CHANGE',
]);

function matchPattern(events: StepEvent[]): Step['action'] | 'UNKNOWN' {
  const len = events.length;
  if (!len) {
    throw new Error('No events found');
  }

  /**
   * CLICK
   * [MOUSEDOWN, MOUSEUP, CLICK]
   * [CLICK]
   */
  if (
    events[0].type === 'MOUSEDOWN' &&
    events[1]?.type === 'MOUSEUP' &&
    events[2]?.type === 'CLICK'
  ) {
    return 'CLICK';
  }
  if (events[0].type === 'CLICK') {
    return 'CLICK';
  }

  /**
   * DRAG
   * [MOUSEDOWN, MOUSEMOVE * n, MOUSEUP, CLICK]
   */
  if (
    events[0].type === 'MOUSEDOWN' &&
    events.slice(1, len - 2).every((e) => e.type === 'MOUSEMOVE') &&
    events[len - 2]?.type === 'MOUSEUP' &&
    events[len - 1]?.type === 'CLICK'
  ) {
    return 'DRAG';
  }

  /**
   * SCROLL
   * [WHELL] [SCROLL * n]
   * [MOUSEDOWN] [SCROLL * n] [MOUSEUP]
   */
  if (
    (events[0].type === 'WHEEL' &&
      events.slice(1, len).every((e) => e.type === 'SCROLL')) ||
    (events[0].type === 'MOUSEDOWN' &&
      events[len - 1].type === 'MOUSEUP' &&
      events.slice(1, len - 1).every((e) => e.type === 'SCROLL'))
  ) {
    return 'SCROLL';
  }

  /**
   * TEXT
   * [Keyboard * n]
   */
  if (events.every((e) => keyboardSet.has(e.type))) {
    return 'TEXT';
  }

  return 'UNKNOWN';
}

function shouldStartNewOne(
  events: StepEvent[],
  newEvent: StepEvent,
  isTargetChanged: boolean,
): boolean {
  if (!events.length) {
    return false;
  }
  const lastEvent = events[events.length - 1];
  /**
   * MOUSEDOWN indicates a new click, which should be an new step
   */
  if (newEvent.type === 'MOUSEDOWN') {
    return true;
  }
  /**
   * SCROLL should be a new step
   */
  if (newEvent.type === 'WHEEL' && isTargetChanged) {
    return true;
  }
  /**
   * need to send step before unload
   */
  if (newEvent.type === 'BEFORE_UNLOAD') {
    return true;
  }
  /**
   * a KEYDOWN follows non-keyboard event should be a new step
   */
  if (newEvent.type === 'KEYDOWN' && !keyboardSet.has(lastEvent.type)) {
    return true;
  }
  /**
   * a BLUR follows TEXT INPUT should be a new step
   */
  if (
    newEvent.type === 'BLUR' &&
    events.some((e) => e.type === 'TEXT_INPUT' || e.type === 'TEXT_CHANGE')
  ) {
    return true;
  }
  return false;
}

function isDragStep(events: StepEvent[], newEvent: StepEvent): boolean {
  if (!events.length) {
    return false;
  }
  if (
    events[0].type === 'MOUSEDOWN' &&
    events[0].timestamp < newEvent.timestamp &&
    events.slice(1).every((e) => e.type === 'MOUSEMOVE')
  ) {
    return true;
  }
  return false;
}

function shouldStopCurrentOne(events: StepEvent[]): boolean {
  if (!events.length) {
    return false;
  }

  const firstEvent = events[0];
  const lastEvent = events[events.length - 1];
  /**
   * CLICK is the last event of a click action
   */
  if (lastEvent.type === 'CLICK') {
    return true;
  }
  /**
   * SCROLL event by middle mouse button click
   */
  if (
    lastEvent.type === 'MOUSEUP' &&
    firstEvent.type === 'MOUSEDOWN' &&
    events[events.length - 2].type === 'SCROLL'
  ) {
    return true;
  }
  return false;
}

function needCollect(event: StepEvent): boolean {
  return !['BLUR', 'BEFORE_UNLOAD'].includes(event.type);
}
