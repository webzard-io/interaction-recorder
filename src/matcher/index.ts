import { EventEmitter2 } from 'eventemitter2';
import { BaseStepEvent, MatcherKey } from '../types';
import { MatcherMachine } from './machine';
import { emitType, MachineMatcherInput, MatcherStep } from './types';

export interface IMatcher<TInput> {
  emitter: EventEmitter2;
  start(): void;
  suspend(): void;
  stop(): void;
  listen: MatcherListener<TInput>;
}

export type MatcherListener<TInput> = (input: TInput) => void;

export type MachineMatcherOptions<
  TStepEvent extends BaseStepEvent = BaseStepEvent,
> = {
  emitter: EventEmitter2;
  onNewStep?: (step: MatcherStep<TStepEvent>) => void;
  onUpdateStep?: (step: MatcherStep<TStepEvent>) => void;
  onEndStep?: (step: MatcherStep<TStepEvent>) => void;
};

export * from './types';

export class MachineMatcher<TStepEvent extends BaseStepEvent = BaseStepEvent>
  implements IMatcher<MachineMatcherInput<TStepEvent>>
{
  public machine = new MatcherMachine(this.emitStep.bind(this));
  public emitter: EventEmitter2;

  private state: 'active' | 'inactive' | 'suspend' = 'inactive';
  private handler: Record<
    emitType,
    ((step: MatcherStep<TStepEvent>) => void) | undefined
  >;

  constructor(options: MachineMatcherOptions<TStepEvent>) {
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

  private emitStep(type: emitType, step: MatcherStep<TStepEvent>) {
    const fn = this.handler[type];
    fn && fn(step);
  }

  public listen(input: MachineMatcherInput<TStepEvent>) {
    const { event, element: target } = input;
    this.machine.send({
      // seems like a ts bug, a union type over 20 type in it, it will not handle equality to another same union type
      type: event.type as any,
      data: event as any,
      target,
    });
  }
}
