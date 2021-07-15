import { PatternMatcher, PatternMatcherExtendParams } from './matcher/matcher';
import { EventObserver } from './observers';
import { Recorder, RecorderOptions } from './recorder';

export class InteractionRecorder {
  private _observer: EventObserver;
  public get observer(): EventObserver {
    return this._observer;
  }

  private _recorder: Recorder;
  public get recorder(): Recorder {
    return this._recorder;
  }

  constructor(win: Window, options: Omit<RecorderOptions, 'matcher'>) {
    this._observer = new EventObserver(win);

    this._recorder = new Recorder({
      ...options,
      matcher: new PatternMatcher(),
    });

    this._recorder.extendAction<PatternMatcherExtendParams>({
      observer: this._observer,
    });
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
