import { Listener } from 'eventemitter2';
import { IMatcher } from './matcher';
import { AbstractObserver, IObserver } from './observers';
import { MatcherKey, StepEvent } from './types';

export type RecorderOptions = {
  matcher: IMatcher;
};

export class Recorder {
  private observersList: IObserver[] = [];
  private listenerMap: WeakMap<IObserver, Listener> = new WeakMap();

  private matcher: IMatcher;

  private _state: 'active' | 'inactive' | 'suspend' = 'inactive';

  public get state(): 'active' | 'inactive' | 'suspend' {
    return this._state;
  }

  constructor(options: RecorderOptions) {
    const { matcher } = options;
    this.matcher = matcher;
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

  public extendObserver(observer: AbstractObserver): AbstractObserver {
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
        this.matcher.emitter.emit(MatcherKey.RECEIVE_NEW_EVENT, event, target);
      },
      {
        objectify: true,
      },
    ) as Listener;

    this.listenerMap.set(observer, listener);
    return observer;
  }

  public removeObserver(observer: AbstractObserver): void {
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
  }
}
