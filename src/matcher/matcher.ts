/* eslint-disable @typescript-eslint/no-unused-vars */
import { EventEmitter2 } from 'eventemitter2';
import { isInputLikeElement } from '..';
import { AbstractObserver } from '../observers';
import {
  AuxClickEvent,
  BlurEvent,
  ClickEvent,
  DblClickEvent,
  DraggingEvent,
  KeydownEvent,
  KeypressEvent,
  KeyupEvent,
  MatcherKey,
  MousedownEvent,
  MousemoveEvent,
  MouseupEvent,
  Step,
  StepEvent,
  TextChangeEvent,
  TextInputEvent,
} from '../types';
import { isMetaKey, isSpecialKey } from '../util/special-key-map';
import { MatcherMachine } from './machine';

export interface IMatcher {
  emitter?: EventEmitter2;
  start(): void;
  suspend(): void;
  stop(): void;
}

export type PatternInterceptor = (matcher: IMatcher) => boolean;

export interface IExtendParams {
  observer: AbstractObserver;
}

export type PatternMatcherExtendParams = IExtendParams & {
  pattern?: (steps: StepEvent[]) => Step['type'] | undefined;
};

export enum HandleResult {
  IGNORE = 0,
  MERGE = 1,
  NEW = 2,
}

const dblclickMaxGap = 350;

export type MatcherStep = Omit<Step, 'selector'> & {
  target: HTMLElement | null;
};

export class PatternMatcher implements IMatcher {
  public emitter?: EventEmitter2;

  public currentStep?: MatcherStep;
  public previousStep?: MatcherStep;

  public machine = new MatcherMachine();

  private state: 'active' | 'inactive' | 'suspend' = 'inactive';

  public start(): void {
    if (this.state === 'inactive') {
      this.emitter?.addListener(
        MatcherKey.NEW_EVENT,
        (event: StepEvent, target: HTMLElement | null) => {
          this.handleEvent(event, target);
          this.machine.send({
            type: event.type,
            data: event as any,
            target: target,
          });
        },
      );
    }
    this.state = 'active';
  }

  public suspend(): void {
    if (this.state === 'active') {
      this.state = 'suspend';
    }
  }

  public stop(): void {
    this.emitter?.removeAllListeners();
    this.state = 'inactive';
  }

  private emitCurrentStep() {
    if (!this.currentStep) {
      return;
    }
    this.previousStep = this.currentStep;
    this.emitter?.emit(
      MatcherKey.EMIT,
      this.currentStep.type,
      this.currentStep.events,
      this.currentStep.target,
    );
    this.currentStep = undefined;
  }

  private handleEvent(stepEvent: StepEvent, target: HTMLElement | null) {
    // when there is no current step, create a new step by current step;
    if (!this.currentStep) {
      this.createNewStep(stepEvent, target);
    } else {
      let flag = HandleResult.IGNORE;
      switch (stepEvent.type) {
        case 'auxclick':
          flag = this.handleAuxClick(stepEvent, target);
          break;
        case 'click':
          flag = this.handleClick(stepEvent, target);
          break;
        case 'dblclick':
          flag = this.handleDoubleClick(stepEvent, target);
          break;
        case 'mousedown':
          flag = this.handleMouseDown(stepEvent, target);
          break;
        case 'mousemove':
          flag = this.handleMouseMove(stepEvent, target);
          break;
        case 'mouseup':
          flag = this.handleMouseUp(stepEvent, target);
          break;
        case 'blur':
          flag = this.handleBlur(stepEvent, target);
          break;
        case 'keydown':
          flag = this.handleKeyDown(stepEvent, target);
          break;
        case 'keypress':
          flag = this.handleKeyPress(stepEvent, target);
          break;
        case 'keyup':
          flag = this.handleKeyUp(stepEvent, target);
          break;
        case 'text_change':
          flag = this.handleTextChange(stepEvent, target);
          break;
        case 'text_input':
          flag = this.handleTextInput(stepEvent, target);
          break;
        case 'drag':
          flag = this.handleDrag(stepEvent, target);
          break;
        case 'dragend':
        case 'dragstart':
        case 'dragenter':
        case 'dragleave':
        case 'dragover':
        case 'drop':
          flag =
            this.currentStep.type === 'DRAG'
              ? HandleResult.MERGE
              : HandleResult.IGNORE;
          break;
        case 'scroll':
          this.currentStep.type === 'SCROLL' && (flag = HandleResult.MERGE);
          break;
        case 'file':
          this.currentStep.type = 'BROWSE_FILE';
          flag = HandleResult.MERGE;
          break;
      }
      switch (flag) {
        case HandleResult.MERGE:
          this.currentStep.events.push(stepEvent);
          break;
        case HandleResult.NEW:
          this.emitCurrentStep();
          this.needCollect(stepEvent.type) &&
            this.createNewStep(stepEvent, target);
      }
    }
  }

  private createNewStep(event: StepEvent, target: HTMLElement | null) {
    // if event come with no target, it should not be the first event;
    if (!target) {
      return;
    }
    let type: Step['type'] = 'UNKNOWN';
    // infer the type by the first step, it will not be the final type;
    switch (event.type) {
      case 'mousedown':
        type = 'CLICK';
        break;
      case 'keydown':
        type =
          isInputLikeElement(target) && !isSpecialKey(event.key)
            ? 'TEXT'
            : 'KEYPRESS';
        break;
      case 'mousemove':
        // not treate mousemove as a new events beginning
        return;
      case 'keyup':
        // a single keyup event may caused by refresh page, not collect it.
        return;
      case 'blur':
        // a single blur should not be collected
        return;
      case 'text_input':
      case 'text_change':
        type = 'TEXT';
        break;
      case 'drop':
        type = 'DROP_FILE';
        break;
      case 'wheel':
        type = 'SCROLL';
        break;
      default:
        type = 'UNKNOWN';
        break;
    }
    this.currentStep = {
      type,
      events: [event],
      target,
    };
  }

  private needCollect(type: StepEvent['type']) {
    return !['blur', 'before_unload'].includes(type);
  }

  private handleBlur(event: BlurEvent, target: HTMLElement | null) {
    // a blur caused by file picker should be ignored.
    return target === window && this.currentStep?.type !== 'BROWSE_FILE'
      ? HandleResult.NEW
      : HandleResult.IGNORE;
  }

  //#region event handler
  private handleMouseDown(
    event: MousedownEvent,
    target: HTMLElement | null,
  ): HandleResult {
    if (!this.currentStep) {
      throw Error('unreachable path!');
    }
    // if current step is already a double click, not continully add mouse click event to it.
    if (this.currentStep.type === 'DBLCLICK') {
      return HandleResult.NEW;
    }
    const lastEvent = this.currentStep.events.slice(-1)[0];
    // if last event is a click event on the same target with in a short time and use the primary button, mark current step as dblclick step;
    if (
      (!this.previousStep || this.previousStep.type !== 'DBLCLICK') &&
      this.currentStep.type === 'CLICK' &&
      lastEvent.type === 'click' &&
      event.button === lastEvent.button &&
      event.timestamp - lastEvent.timestamp <= dblclickMaxGap &&
      this.currentStep.target === target
    ) {
      this.currentStep.type = 'DBLCLICK';
      return HandleResult.MERGE;
    }

    // if there is already at least one mouse button not released, treat them in the same step.
    if (
      this.currentStep.type === 'CLICK' &&
      this.currentStep.events.filter((event) => event.type === 'mousedown')
        .length ===
        this.currentStep.events.filter((event) => event.type === 'mouseup')
          .length +
          1
    ) {
      return HandleResult.MERGE;
    }
    return HandleResult.NEW;
  }

  private handleMouseMove(event: MousemoveEvent, target: HTMLElement | null) {
    if (!this.currentStep) {
      throw Error('unreachable path!');
    }
    const lastEvent = this.currentStep.events.slice(-1)[0];
    if (
      this.currentStep.events[0].type === 'mousedown' &&
      this.currentStep.events
        .slice(1)
        .every((event) => event.type === 'mousemove') &&
      this.currentStep
    ) {
      if (
        lastEvent.type === 'mousedown' &&
        event.positions.length === 1 &&
        event.positions[0].clientX === lastEvent.clientX &&
        event.positions[0].clientY === lastEvent.clientY
      ) {
        return HandleResult.IGNORE;
      }
      this.currentStep.type = 'DRAG';
      return HandleResult.MERGE;
    }
    return HandleResult.IGNORE;
  }

  private handleMouseUp(event: MouseupEvent, target: HTMLElement | null) {
    return HandleResult.MERGE;
  }

  private handleClick(event: ClickEvent, target: HTMLElement | null) {
    if (
      target &&
      target.tagName === 'INPUT' &&
      (target as HTMLInputElement).type === 'file'
    ) {
      this.currentStep!.type = 'BROWSE_FILE';
    }
    return HandleResult.MERGE;
  }

  private handleAuxClick(event: AuxClickEvent, target: HTMLElement | null) {
    return HandleResult.MERGE;
  }

  private handleDoubleClick(event: DblClickEvent, target: HTMLElement | null) {
    return HandleResult.MERGE;
  }

  private handleKeyDown(event: KeydownEvent, target: HTMLElement | null) {
    if (!this.currentStep) {
      throw Error('unreachable path!');
    }
    if (target !== this.currentStep.target) {
      return HandleResult.NEW;
    }
    if (this.currentStep.type === 'TEXT') {
      // only merge keydown event as a group when user are typing
      if (isSpecialKey(event.key)) {
        // special key won't effect
        return HandleResult.NEW;
      }
      if (isMetaKey(event.key)) {
        // merge meta key when typing
        return HandleResult.MERGE;
      }
      return HandleResult.MERGE;
    } else if (this.currentStep.type === 'KEYPRESS') {
      if (
        // key combination
        this.currentStep.events.filter((event) => event.type === 'keydown') >
        this.currentStep.events.filter((event) => event.type === 'keyup')
      ) {
        return HandleResult.MERGE;
      }
      return HandleResult.NEW;
    } else {
      return HandleResult.NEW;
    }
  }

  private handleKeyPress(event: KeypressEvent, target: HTMLElement | null) {
    return HandleResult.MERGE;
  }
  private handleKeyUp(event: KeyupEvent, target: HTMLElement | null) {
    return HandleResult.MERGE;
  }

  private handleTextInput(event: TextInputEvent, target: HTMLElement | null) {
    return this.currentStep?.type === 'TEXT' &&
      target === this.currentStep.target
      ? HandleResult.MERGE
      : HandleResult.NEW;
  }

  private handleTextChange(event: TextChangeEvent, target: HTMLElement | null) {
    return this.currentStep?.type === 'TEXT' &&
      target === this.currentStep.target
      ? HandleResult.MERGE
      : HandleResult.NEW;
  }

  private handleDrag(event: DraggingEvent, target: HTMLElement | null) {
    if (this.currentStep?.type === 'CLICK') {
      this.currentStep.type = 'DRAG';
    }
    return HandleResult.MERGE;
  }
  //#endregion event handler
}
