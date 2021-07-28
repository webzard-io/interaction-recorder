import { EventEmitter2 } from 'eventemitter2';
import { MatcherKey } from '../types';
import { MatcherMachine } from './machine';
import { emitType, MachineMatcherInput, MatcherStep } from './types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface IMatcher<TInput> {
  emitter: EventEmitter2;
  start(): void;
  suspend(): void;
  stop(): void;
  listen: MatcherListener<TInput>;
}

export type MatcherListener<TInput> = (input: TInput) => void;

export type MachineMatcherOptions = {
  emitter: EventEmitter2;
  onNewStep?: (step: MatcherStep) => void;
  onUpdateStep?: (step: MatcherStep) => void;
  onEndStep?: (step: MatcherStep) => void;
};

export class MachineMatcher implements IMatcher<MachineMatcherInput> {
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
        MatcherKey.RECEIVE_NEW_EVENT,
        this.listen.bind(this),
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

  public listen(input: MachineMatcherInput) {
    arguments.callee;
    const { event, element: target } = input;
    this.machine.send({
      type: event.type,
      // TODO: remove as any, add key-value map for type and data;
      data: event as any,
      target,
    });
  }
}
