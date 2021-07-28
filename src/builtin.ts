import { EventEmitter2 } from 'eventemitter2';
import { MachineMatcher } from './matcher';
import {
  MachineMatcherInput,
  MatcherElement,
  MatcherStep,
} from './matcher/types';
import { EventObserver } from './observers';
import { Recorder } from './recorder';
import { StepEvent } from './types';
import { randomId } from './util/fn';

export type InteractionRecorderOptions = {
  onNewStep: (step: MatcherStep) => void;
  onEndStep: (step: MatcherStep) => void;
  onUpdateStep: (step: MatcherStep) => void;
};

class ElementSerializer {
  private ElementMap = new Map<string, HTMLElement>();
  private idMap = new Map<HTMLElement, string>();

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
        id: this.idMap.get(ele) || randomId(),
        tagName: ele.tagName,
        attributes: this.serializeAttribute(ele),
      };
    }
  }

  public getElementById(id: string): HTMLElement | undefined {
    return this.ElementMap.get(id);
  }

  public clear() {
    this.idMap.clear();
    this.ElementMap.clear();
  }

  private serializeAttribute(ele: HTMLElement): Record<string, string> {
    const result: Record<string, string> = {};
    for (let i = 0; i < ele.attributes.length; i++) {
      const attr = ele.attributes[i];
      result[attr.name] = attr.value;
    }
    return result;
  }
}

export class InteractionRecorder {
  private serializer = new ElementSerializer();
  private _observer: EventObserver<MachineMatcherInput>;
  public get observer(): EventObserver<MachineMatcherInput> {
    return this._observer;
  }

  private _recorder: Recorder<StepEvent, MachineMatcherInput>;
  public get recorder(): Recorder<StepEvent, MachineMatcherInput> {
    return this._recorder;
  }

  constructor(win: Window, options?: InteractionRecorderOptions) {
    this._observer = new EventObserver<MachineMatcherInput>(
      win,
      (stepevent, target: HTMLElement) => {
        return {
          event: stepevent,
          element: this.serializer.getSerializedItem(target),
        };
      },
    );

    this._recorder = new Recorder({
      matcher: new MachineMatcher({
        emitter: new EventEmitter2(),
        onNewStep: options?.onNewStep,
        onUpdateStep: options?.onUpdateStep,
        onEndStep: (step) => {
          this.serializer.clear();
          options?.onEndStep(step);
        },
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
