import { EventEmitter2 } from 'eventemitter2';
import { MachineMatcher } from './matcher';
import {
  MachineMatcherInput,
  MatcherElement,
  MatcherStep,
} from './matcher/types';
import { EventObserver, EventObserverStepEvent } from './observer';
import { Recorder } from './recorder';
import { randomId } from './util/fn';

// dataset key in js should be under camel case and in html it should be under kebab case with data- prefix
const DOMID_DATASET_KEY = 'interactionRecorderDomid';
const DOMID_DATASET_ATTR = 'data-interaction-recorder-domid';
export type InteractionRecorderOptions = {
  onNewStep: (step: MatcherStep<EventObserverStepEvent>) => void;
  onEndStep: (step: MatcherStep<EventObserverStepEvent>) => void;
  onUpdateStep: (step: MatcherStep<EventObserverStepEvent>) => void;
};

export class ElementSerializer {
  public getElementById(id: string): HTMLElement | null {
    return document.querySelector<HTMLElement>(
      `[${DOMID_DATASET_ATTR}="${id}"]`,
    );
  }

  public getSerializedItem(
    ele: HTMLElement | Window | null,
  ): MatcherElement | null {
    if (!ele) {
      return null;
    } else if (ele instanceof Window) {
      return {
        id: 'window',
        tagName: 'window',
        attributes: {},
      };
    } else {
      return {
        id: this.getIdByElement(ele)!,
        tagName: ele.tagName,
        attributes: this.serializeAttribute(ele),
      };
    }
  }

  private serializeAttribute(ele: HTMLElement): Record<string, string> {
    const result: Record<string, string> = {};
    for (const attr of ele.attributes) {
      if (attr.name === DOMID_DATASET_ATTR) continue;
      result[attr.name] = attr.value;
    }
    return result;
  }

  public getIdByElement(element: HTMLElement | null): string | undefined {
    if (!element) {
      return undefined;
    }
    if (!element.dataset[DOMID_DATASET_KEY]) {
      element.dataset[DOMID_DATASET_KEY] = randomId();
    }
    return element.dataset[DOMID_DATASET_KEY];
  }
}

export class InteractionRecorder {
  private serializer = new ElementSerializer();
  private _observer: EventObserver<MachineMatcherInput<EventObserverStepEvent>>;
  public get observer(): EventObserver<
    MachineMatcherInput<EventObserverStepEvent>
  > {
    return this._observer;
  }

  private _recorder: Recorder<
    EventObserverStepEvent,
    MachineMatcherInput<EventObserverStepEvent>
  >;
  public get recorder(): Recorder<
    EventObserverStepEvent,
    MachineMatcherInput<EventObserverStepEvent>
  > {
    return this._recorder;
  }

  constructor(win: Window, options?: InteractionRecorderOptions) {
    this._observer = new EventObserver<
      MachineMatcherInput<EventObserverStepEvent>
    >(win, (stepevent, target: HTMLElement) => {
      return {
        event: stepevent,
        element: this.serializer.getSerializedItem(target),
      };
    });

    this._recorder = new Recorder({
      matcher: new MachineMatcher<EventObserverStepEvent>({
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
