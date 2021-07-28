import { IMatcher } from './matcher';
import { AbstractObserver } from './observers';
import { MatcherKey } from './types';

export type RecorderOptions<TMiddleware> = {
  matcher: IMatcher<TMiddleware>;
};

export class Recorder<TEvent, TMiddleware> {
  private observersList: AbstractObserver<TEvent, TMiddleware>[] = [];
  private listenerMap: WeakMap<
    AbstractObserver<TEvent, TMiddleware>,
    // eslint-disable-next-line @typescript-eslint/ban-types
    (middleware: TMiddleware) => void
  > = new WeakMap();

  private matcher: IMatcher<TMiddleware>;

  private _state: 'active' | 'inactive' | 'suspend' = 'inactive';

  public get state(): 'active' | 'inactive' | 'suspend' {
    return this._state;
  }

  constructor(options: RecorderOptions<TMiddleware>) {
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

  public extendObserver(
    observer: AbstractObserver<TEvent, TMiddleware>,
  ): AbstractObserver<TEvent, TMiddleware> {
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
    const listener = observer.on((event) => {
      this.matcher.emitter.emit(MatcherKey.RECEIVE_NEW_EVENT, event);
    });
    this.listenerMap.set(observer, listener);
    return observer;
  }

  public removeObserver(observer: AbstractObserver<TEvent, TMiddleware>): void {
    if (this._state === 'active') {
      console.warn(
        'cannot extend recorder when active, please suspend or stop recorder first',
      );
      return;
    }
    // remove observer emitter;
    const listener = this.listenerMap.get(observer);
    listener && observer.emitter.off(`observer.${observer.name}`, listener);
    this.listenerMap.delete(observer);
    const index = this.observersList.indexOf(observer);
    if (index !== -1) {
      this.observersList.splice(index, 1);
    }
  }
}
