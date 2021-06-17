import { Step, StepEvent } from './types';

const keyboardSet = new Set([
  'KEYDOWN',
  'KEYPRESS',
  'KEYUP',
  'TEXT_INPUT',
  'TEXT_CHANGE',
]);

export function matchPattern(events: StepEvent[]): {
  action: Step['action'] | 'UNKNOWN';
} {
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
    return {
      action: 'CLICK',
    };
  }
  if (events[0].type === 'CLICK') {
    return {
      action: 'CLICK',
    };
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
    return {
      action: 'DRAG',
    };
  }

  /**
   * SCROLL
   * [SCROLL]
   */
  if (events.every((e) => e.type === 'SCROLL')) {
    return {
      action: 'SCROLL',
    };
  }

  /**
   * TEXT
   * [Keyboard * n]
   */
  if (events.every((e) => keyboardSet.has(e.type))) {
    return {
      action: 'TEXT',
    };
  }

  return {
    action: 'UNKNOWN',
  };
}

export function shouldStartNewOne(
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
  if (newEvent.type === 'SCROLL' && isTargetChanged) {
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

export function isDragStep(events: StepEvent[], newEvent: StepEvent): boolean {
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

export function shouldStopCurrentOne(events: StepEvent[]): boolean {
  if (!events.length) {
    return false;
  }
  const lastEvent = events[events.length - 1];
  /**
   * CLICK is the last event of a click action
   */
  if (lastEvent.type === 'CLICK') {
    return true;
  }
  /**
   * SCROLL indicates STEP is complete
   */
  if (lastEvent.type === 'SCROLL') {
    return true;
  }
  return false;
}

export function needCollect(event: StepEvent): boolean {
  return !['BLUR', 'BEFORE_UNLOAD'].includes(event.type);
}
