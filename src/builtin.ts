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

export type InteractionRecorderOptions = {
  onNewStep: (step: MatcherStep<EventObserverStepEvent>) => void;
  onEndStep: (step: MatcherStep<EventObserverStepEvent>) => void;
  onUpdateStep: (step: MatcherStep<EventObserverStepEvent>) => void;
};

export class ElementSerializer {
  private ElementMap = new Map<string, HTMLElement>();
  private idMap = new Map<HTMLElement, string>();

  constructor() {
    const observer = new MutationObserver((list) => {
      const removed = new Set<HTMLElement>();
      for (let i = 0; i < list.length; i++) {
        const removedNodes = list[i].removedNodes;
        for (let j = 0; j < removedNodes.length; j++) {
          const node = removedNodes[j];
          if (node.nodeType !== 1) {
            continue;
          }
          removed.add(node as HTMLElement);
        }
      }
      const toRemoved: Array<[HTMLElement, string]> = [];
      this.ElementMap.forEach((ele, id) => {
        for (const node of removed) {
          if (node === ele || node.contains(ele)) {
            toRemoved.push([ele, id]);
            break;
          }
        }
      });
      for (let i = 0; i < toRemoved.length; i++) {
        this.ElementMap.delete(toRemoved[i][1]);
        this.idMap.delete(toRemoved[i][0]);
      }
    });
    observer.observe(document, {
      childList: true,
      subtree: true,
    });
  }

  public getElementById(id: string): HTMLElement | undefined {
    return this.ElementMap.get(id);
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
    for (let i = 0; i < ele.attributes.length; i++) {
      const attr = ele.attributes[i];
      result[attr.name] = attr.value;
    }
    return result;
  }

  public getIdByElement(element: HTMLElement | null): string | undefined {
    if (!element) {
      return undefined;
    }
    let id = this.idMap.get(element);
    if (!id) {
      id = randomId();
      this.ElementMap.set(id, element);
      this.idMap.set(element, id);
    }
    return id;
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
