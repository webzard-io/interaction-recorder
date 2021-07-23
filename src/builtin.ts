import { EventEmitter2 } from 'eventemitter2';
import { MachineMatcher } from './matcher';
import { MatcherStep } from './matcher/types';
import { EventObserver } from './observers';
import { Recorder } from './recorder';

export type InteractionRecorderOptions = {
  onNewStep: (step: MatcherStep) => void;
  onEndStep: (step: MatcherStep) => void;
  onUpdateStep: (step: MatcherStep) => void;
};

export class InteractionRecorder {
  private _observer: EventObserver;
  public get observer(): EventObserver {
    return this._observer;
  }

  private _recorder: Recorder;
  public get recorder(): Recorder {
    return this._recorder;
  }

  constructor(win: Window, options?: InteractionRecorderOptions) {
    this._observer = new EventObserver(win);
    this._recorder = new Recorder({
      matcher: new MachineMatcher({
        emitter: new EventEmitter2(),
        onNewStep: options?.onNewStep,
        onUpdateStep: options?.onUpdateStep,
        onEndStep: options?.onEndStep,
      }),
    });
    this._recorder.extendObserver(this._observer);
  }

  public start(): void {
    this._recorder.start();
  }

  public suspend(): void {
    this._recorder.suspend();
  }
  public stop(): void {
    this._recorder.stop();
  }
}
