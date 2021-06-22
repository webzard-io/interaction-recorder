import { EventEmitter2 } from 'eventemitter2';
import { IObserver } from './observers';
import { MatcherKey, Step, StepEvent } from './types';

export interface IMatcher {
  emitter?: EventEmitter2;
  start(): void;
  suspend(): void;
  stop(): void;
  extendAction(action: IExtendParams): void;
  removeAction(observer: IObserver): void;
}

export type PatternInterceptor = (matcher: IMatcher) => boolean;

export interface IExtendParams {
  observer: IObserver;
}
export type PatternMatcherExtendParams = IExtendParams & {
  pattern?: (steps: StepEvent[]) => Step['action'] | 'UNKNOWN';
  actionBeforeCollectStep?: (
    matcher: PatternMatcher,
    newEvent: StepEvent,
    target: HTMLElement | null,
  ) => 'return' | 'emit' | undefined;
  actionWhileCollectStep?: (
    matcher: PatternMatcher,
    newEvent: StepEvent,
    target: HTMLElement | null,
  ) => 'return' | 'collect' | undefined;
  actionAfterCollectStep?: (
    matcher: PatternMatcher,
    newEvent: StepEvent,
    target: HTMLElement | null,
  ) => 'return' | 'emit' | undefined;
};

export class PatternMatcher implements IMatcher {
  public emitter?: EventEmitter2;
  public currentTarget: HTMLElement | null = null;
  public currentEvents: StepEvent[] = [];

  private actionBeforeCollectStep: Map<
    IObserver,
    PatternMatcherExtendParams['actionBeforeCollectStep']
  > = new Map();
  private actionWhileCollectStep: Map<
    IObserver,
    PatternMatcherExtendParams['actionWhileCollectStep']
  > = new Map();
  private actionAfterCollectStep: Map<
    IObserver,
    PatternMatcherExtendParams['actionAfterCollectStep']
  > = new Map();

  private patternMatcher: Map<
    IObserver,
    PatternMatcherExtendParams['pattern']
  > = new Map();

  private state: 'active' | 'inactive' | 'suspend' = 'inactive';

  public start(): void {
    if (this.state === 'inactive') {
      this.emitter?.addListener(
        MatcherKey.NEW_EVENT,
        (event: StepEvent, target: HTMLElement | null) => {
          this.handleNewEvent(event, target);
        },
      );
    }
    this.state = 'active';
  }

  public suspend(): void {
    if (this.state === 'active') {
      this.state = 'suspend';
    }
  }

  public stop(): void {
    this.emitter?.removeAllListeners();
    this.actionBeforeCollectStep = new Map();
    this.actionAfterCollectStep = new Map();
    this.actionWhileCollectStep = new Map();
    this.patternMatcher = new Map();
    this.state = 'inactive';
    this.currentEvents.length = 0;
    this.currentTarget = null;
  }

  public extendAction(action: PatternMatcherExtendParams): void {
    const {
      observer,
      actionBeforeCollectStep,
      actionWhileCollectStep,
      actionAfterCollectStep,
      pattern,
    } = action;
    actionBeforeCollectStep &&
      this.actionBeforeCollectStep.set(observer, actionBeforeCollectStep);
    actionWhileCollectStep &&
      this.actionWhileCollectStep.set(observer, actionWhileCollectStep);
    actionAfterCollectStep &&
      this.actionAfterCollectStep.set(observer, actionAfterCollectStep);
    pattern && this.patternMatcher.set(observer, pattern);
  }

  public removeAction(observer: IObserver): void {
    this.actionBeforeCollectStep.delete(observer);
    this.actionWhileCollectStep.delete(observer);
    this.actionAfterCollectStep.delete(observer);
    this.patternMatcher.delete(observer);
  }

  private matchPattern() {
    for (const [, handler] of this.patternMatcher) {
      const action = handler && handler(this.currentEvents);
      if (!action) {
        continue;
      }
      return {
        action,
      };
    }
    return {
      action: 'UNKNOWN',
    };
  }

  private emitCurrentStep() {
    const { action } = this.matchPattern();
    this.emitter?.emit(
      MatcherKey.EMIT,
      action,
      this.currentEvents.splice(0, this.currentEvents.length),
      this.currentTarget,
    );
  }

  private handleNewEvent(stepEvent: StepEvent, target: HTMLElement | null) {
    for (const [, handler] of this.actionBeforeCollectStep) {
      const result = handler && handler(this, stepEvent, target);
      if (!result) {
        continue;
      } else if (result === 'return') {
        return;
      } else if (result === 'emit') {
        this.emitCurrentStep();
        break;
      }
    }

    for (const [, handler] of this.actionWhileCollectStep) {
      const result = handler && handler(this, stepEvent, target);
      if (!result) {
        continue;
      } else if (result === 'return') {
        return;
      } else if (result === 'collect') {
        this.collectEvent(stepEvent, target);
        break;
      }
    }

    for (const [, handler] of this.actionAfterCollectStep) {
      const result = handler && handler(this, stepEvent, target);
      if (!result) {
        continue;
      } else if (result === 'return') {
        return;
      } else if (result === 'emit') {
        this.emitCurrentStep();
        break;
      }
    }
  }

  private collectEvent(stepEvent: StepEvent, target: HTMLElement | null) {
    this.currentTarget = target;
    this.currentEvents.push(stepEvent);
  }
}
