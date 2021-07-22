import { EventEmitter2 } from 'eventemitter2';
import { MatcherKey, StepEvent } from '../types';
import { MatcherMachine } from './machine';
import { emitType, MatcherStep } from './types';

export interface IMatcher {
  emitter: EventEmitter2;
  start(): void;
  suspend(): void;
  stop(): void;
}

export type MachineMatcherOptions = {
  emitter: EventEmitter2;
  onNewStep?: (step: MatcherStep) => void;
  onUpdateStep?: (step: MatcherStep) => void;
  onEndStep?: (step: MatcherStep) => void;
};

export class MachineMatcher implements IMatcher {
  public machine = new MatcherMachine(this.emitStep.bind(this));
  public emitter: EventEmitter2;

  private state: 'active' | 'inactive' | 'suspend' = 'inactive';
  private handler: Record<emitType, ((step: MatcherStep) => void) | undefined>;

  constructor(options: MachineMatcherOptions) {
    this.handler = {
      new: options.onNewStep,
      update: options.onUpdateStep,
      end: options.onEndStep,
    };
    this.emitter = options.emitter;
  }

  public start(): void {
    if (this.state === 'inactive') {
      this.emitter.addListener(
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
    this.emitter.removeAllListeners();
    this.state = 'inactive';
  }

  private emitStep(type: emitType, step: MatcherStep) {
    const fn = this.handler[type];
    fn && fn(step);
  }
}
