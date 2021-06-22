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
  preStep?: (
    matcher: PatternMatcher,
    newEvent: StepEvent,
    target: HTMLElement | null,
  ) => 'return' | 'emit' | undefined;
  collectStep?: (
    matcher: PatternMatcher,
    newEvent: StepEvent,
    target: HTMLElement | null,
  ) => 'return' | 'collect' | undefined;
  postStep?: (
    matcher: PatternMatcher,
    newEvent: StepEvent,
    target: HTMLElement | null,
  ) => 'return' | 'emit' | undefined;
};

export class PatternMatcher implements IMatcher {
  public emitter?: EventEmitter2;
  public currentTarget: HTMLElement | null = null;
  public currentEvents: StepEvent[] = [];

  private preStep: Map<IObserver, PatternMatcherExtendParams['preStep']> =
    new Map();
  private collectStep: Map<
    IObserver,
    PatternMatcherExtendParams['collectStep']
  > = new Map();
  private postStep: Map<IObserver, PatternMatcherExtendParams['postStep']> =
    new Map();

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
    this.state = 'suspend';
  }

  public stop(): void {
    this.emitter?.removeAllListeners();
    this.preStep = new Map();
    this.postStep = new Map();
    this.collectStep = new Map();
    this.patternMatcher = new Map();
    this.state = 'inactive';
    this.currentEvents.length = 0;
    this.currentTarget = null;
  }

  public extendAction(action: PatternMatcherExtendParams): void {
    const { observer, preStep, collectStep, postStep, pattern } = action;
    preStep && this.preStep.set(observer, preStep);
    collectStep && this.collectStep.set(observer, collectStep);
    postStep && this.postStep.set(observer, postStep);
    pattern && this.patternMatcher.set(observer, pattern);
  }

  public removeAction(observer: IObserver): void {
    this.preStep.delete(observer);
    this.collectStep.delete(observer);
    this.postStep.delete(observer);
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
    for (const [, handler] of this.preStep) {
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

    for (const [, handler] of this.collectStep) {
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

    for (const [, handler] of this.postStep) {
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
