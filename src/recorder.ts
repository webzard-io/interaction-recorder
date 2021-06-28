import { EventEmitter2, Listener } from 'eventemitter2';
import { IExtendParams, IMatcher } from './matcher';
import { IObserver } from './observers';
import { MatcherKey, Step, StepEvent } from './types';
import { BasicMetaQuerier, IMetaQuerier } from './util/metaquerier';

type StepEventHandler = (step: Step) => void;

export type RecorderOptions = {
  matcher: IMatcher;
  onEmit: StepEventHandler;
  metaQuerier?: IMetaQuerier;
};

export class Recorder {
  private observersList: IObserver[] = [];
  private listenerMap: WeakMap<IObserver, Listener> = new WeakMap();

  private matcher: IMatcher;

  private onEmit: StepEventHandler;
  private metaQuerier: IMetaQuerier;

  private _state: 'active' | 'inactive' | 'suspend' = 'inactive';

  public get state(): 'active' | 'inactive' | 'suspend' {
    return this._state;
  }

  constructor(options: RecorderOptions) {
    const { matcher, onEmit, metaQuerier } = options;
    this.matcher = matcher;
    this.matcher.emitter = new EventEmitter2();
    this.onEmit = onEmit;
    this.matcher.emitter.on(
      MatcherKey.EMIT,
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
    this._state = 'active';
    this.observersList.forEach((obs) => {
      obs.start();
    });
    this.matcher.start();
  }

  public suspend(): void {
    this._state = 'suspend';
    this.observersList.forEach((obs) => {
      obs.suspend();
    });
    this.matcher.suspend();
  }

  public stop(): void {
    this._state = 'inactive';
    this.observersList.forEach((obs) => {
      obs.stop();
    });
    this.matcher.stop();
  }

  public extendAction<params extends IExtendParams>(action: params): IObserver {
    const { observer } = action;
    if (this._state === 'active') {
      console.warn(
        'cannot extend recorder when active, please suspend or stop recorder first',
      );
      return observer;
    }
    if (this.listenerMap.has(observer)) {
      console.warn('the observer has been extended.');
      return observer;
    }
    // add observer emitter;
    this.observersList.push(observer);
    const listener = observer.emitter.on(
      `observer.${observer.name}`,
      (event: StepEvent, target: HTMLElement | null) => {
        this.matcher.emitter!.emit(MatcherKey.NEW_EVENT, event, target);
      },
      {
        objectify: true,
      },
    ) as Listener;

    this.listenerMap.set(observer, listener);
    // extend matcher
    this.matcher.extendAction(action);
    return observer;
  }

  public removeAction(observer: IObserver): void {
    if (this._state === 'active') {
      console.warn(
        'cannot extend recorder when active, please suspend or stop recorder first',
      );
      return;
    }
    // remove observer emitter;
    const listener = this.listenerMap.get(observer);
    listener &&
      observer.emitter.off(`observer.${observer.name}`, listener.listener);
    this.listenerMap.delete(observer);
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
    if (action === 'UNKNOWN') {
      console.error(`Unknown events: ${JSON.stringify(events)}`);
    } else {
      this.onEmit({
        selector: this.metaQuerier.getMeta(target),
        action,
        events,
      });
    }
  }
}
