import { IMetaQuerier, BasicMetaQuerier } from './util/metaquerier';
import {
  matchPattern,
  shouldStartNewOne,
  isDragStep,
  shouldStopCurrentOne,
  needCollect,
} from './match-pattern';
import { EventObserver } from './observer';
import { Step, StepEvent } from './types';
import { EventHandler } from './util/eventbus';

type StepEventHandler = (step: Step) => void;

export type RecorderOptions = {
  doc: Document;
  win: Window;
  onEmit: StepEventHandler;
  metaQuerier?: IMetaQuerier;
  onMouseDown?: EventHandler;
  onMouseUp?: EventHandler;
  onClick?: EventHandler;
  onMouseMove?: EventHandler;
  onScroll?: EventHandler;
  onKeyDown?: EventHandler;
  onKeyPress?: EventHandler;
  onKeyUp?: EventHandler;
  onTextInput?: EventHandler;
  onBlur?: EventHandler;
};

export class Recorder {
  private eventObserver: EventObserver;

  private currentTarget: HTMLElement | null = null;
  private currentEvents: StepEvent[] = [];

  private onEmit: StepEventHandler;
  private metaQuerier: IMetaQuerier;

  constructor(options: RecorderOptions) {
    const { onEmit, metaQuerier, ...restOptions } = options;
    this.onEmit = onEmit;
    this.eventObserver = new EventObserver({
      ...restOptions,
      onEmit: this.eventHandler.bind(this),
    });
    this.metaQuerier = metaQuerier || new BasicMetaQuerier();
  }

  public start(): void {
    this.eventObserver.start();
  }

  public suspend(): void {
    this.eventObserver.suspend();
  }

  private eventHandler(stepEvent: StepEvent, target: HTMLElement | null) {
    /**
     * When a new step event should start a new step,
     * we alos stop the current one.
     */

    if (shouldStartNewOne(this.currentEvents, stepEvent)) {
      this.emitCurrentStep();
      this.collectEvent(stepEvent, target);
      return;
    }

    /**
     * Only track MOUSEMOVE when current step is DRAG
     */
    const isDragMove = isDragStep(this.currentEvents, stepEvent);
    if (stepEvent.type === 'MOUSEMOVE' && !isDragMove) {
      return;
    }

    this.collectEvent(stepEvent, target);

    if (shouldStopCurrentOne(this.currentEvents)) {
      this.emitCurrentStep();
    }
  }

  private collectEvent(stepEvent: StepEvent, target: HTMLElement | null) {
    if (!needCollect(stepEvent)) {
      return;
    }
    this.currentTarget = target;
    this.currentEvents.push(stepEvent);
  }

  private emitCurrentStep() {
    if (!this.currentTarget) {
      throw new Error('current target is missing');
    }
    const { action } = matchPattern(this.currentEvents);
    if (action !== 'UNKNOWN') {
      this.onEmit({
        selector: this.metaQuerier.getMeta(this.currentTarget),
        action,
        events: this.currentEvents,
      });
    } else {
      console.error(`Unknown events: ${JSON.stringify(this.currentEvents)}`);
    }
    this.currentTarget = null;
    this.currentEvents = [];
  }
}
