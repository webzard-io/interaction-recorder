import { EventEmitter2 } from 'eventemitter2';
import { IExtendParams, IMatcher } from './matcher';
import { IObserver } from './observers';
import { Step, StepEvent } from './types';
import { BasicMetaQuerier, IMetaQuerier } from './util/metaquerier';

type StepEventHandler = (step: Step) => void;

export type RecorderOptions = {
  matcher: IMatcher;
  onEmit: StepEventHandler;
  metaQuerier?: IMetaQuerier;
};

export class Recorder {
  private observersList: IObserver[] = [];
  private emitterMap: WeakMap<IObserver, EventEmitter2> = new WeakMap();

  private matcher: IMatcher;

  private onEmit: StepEventHandler;
  private metaQuerier: IMetaQuerier;

  private state: 'active' | 'inactive' | 'suspend' = 'inactive';

  constructor(options: RecorderOptions) {
    const { matcher, onEmit, metaQuerier } = options;
    this.matcher = matcher;
    this.matcher.emitter = new EventEmitter2();
    this.onEmit = onEmit;
    this.matcher.emitter.on(
      'matcher.emit',
      (
        action: Step['action'] | 'UNKNOWN',
        events: StepEvent[],
        target: HTMLElement | null,
      ) => {
        this.emitCurrentStep(action, events, target);
      },
    );
    this.metaQuerier = metaQuerier || new BasicMetaQuerier();
  }

  public start(): void {
    this.state = 'active';
    this.observersList.forEach((obs) => {
      obs.start();
    });
    this.matcher.start();
  }

  public suspend(): void {
    this.state = 'suspend';
    this.observersList.forEach((obs) => {
      obs.suspend();
    });
    this.matcher.suspend();
  }

  public stop(): void {
    this.state = 'inactive';
    this.observersList.forEach((obs) => {
      obs.stop();
    });
    this.matcher.stop();
  }

  public extendAction<params extends IExtendParams>(action: params): IObserver {
    const { observer } = action;
    if (this.state === 'active') {
      console.warn(
        'cannot extend recorder when active, please suspend or stop recorder first',
      );
      return observer;
    }
    if (this.emitterMap.has(observer)) {
      console.warn('the observer has been extended.');
      return observer;
    }
    // add observer emitter;
    this.observersList.push(observer);
    observer.emitter = new EventEmitter2();
    observer.emitter.on(
      `observer.${observer.name}`,
      (event: StepEvent, target: HTMLElement | null) => {
        this.matcher.emitter?.emit('matcher.newEvent', event, target);
      },
    );
    // extend matcher
    this.matcher.extendAction(action);
    return observer;
  }

  public removeAction(observer: IObserver): void {
    if (this.state === 'active') {
      console.warn(
        'cannot extend recorder when active, please suspend or stop recorder first',
      );
      return;
    }
    // remove observer emitter;
    const emitter = this.emitterMap.get(observer);
    emitter?.removeAllListeners();
    const index = this.observersList.indexOf(observer);
    if (index !== -1) {
      this.observersList.splice(index, 1);
    }
    // remove matcher action;
    this.matcher.removeAction(observer);
  }

  private emitCurrentStep(
    action: Step['action'] | 'UNKNOWN',
    events: StepEvent[],
    target: HTMLElement | null,
  ) {
    if (!target) {
      throw new Error('current target is missing');
    }
    switch (action) {
      case 'UNKNOWN':
        console.error(`Unknown events: ${JSON.stringify(events)}`);
        break;
      case 'SCROLL':
        this.onEmit({
          selector: this.metaQuerier.getMeta(target),
          action,
          events: events.filter((event) => event.type === 'SCROLL'),
        });
        break;
      default:
        this.onEmit({
          selector: this.metaQuerier.getMeta(target),
          action,
          events,
        });
        break;
    }
  }
}
