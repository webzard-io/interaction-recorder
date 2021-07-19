import { EventEmitter2 } from 'eventemitter2';
import { MatcherKey, Step, StepEvent } from '../types';
import { MatcherMachine } from './machine';

export interface IMatcher {
  emitter?: EventEmitter2;
  start(): void;
  suspend(): void;
  stop(): void;
}

export type MatcherStep = Omit<Step, 'selector'> & {
  target: HTMLElement | null;
};

export class PatternMatcher implements IMatcher {
  public emitter?: EventEmitter2;

  public machine = new MatcherMachine(this.emitStep.bind(this));

  private state: 'active' | 'inactive' | 'suspend' = 'inactive';

  public start(): void {
    if (this.state === 'inactive') {
      this.emitter?.addListener(
        MatcherKey.NEW_EVENT,
        (event: StepEvent, target: HTMLElement | null) => {
          this.machine.send({
            type: event.type,
            data: event as any,
            target: target,
          });
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
    this.state = 'inactive';
  }

  private emitStep(step: MatcherStep) {
    this.emitter?.emit(MatcherKey.EMIT, step.type, step.events, step.target);
  }
}
