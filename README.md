# interaction recorder

This is a project aiming for recording user's interaction to a reproducible data.

## how to use

```bash
npm install interaction-recorder
```

```typescript
import { InteractionRecorder } from 'interaction-recorder';

const interactionRecorder = new InteractionRecorder(window, {
  onEmit: (step) => {
    console.log(step);
  },
});

interactionRecorder.start();
// do some interaction to website and see what will be logged to console
```

## project structure

It contains three core component:

### 1.observer

observer is for collecting event triggered by user's interaction.

built-in recorder has an observer that observe:
- mouse interaction
- keyboard interaction
- text input interaction
- scroll interaction

### 2.matcher

An interaction of user may trigger multiple events, matcher is for composing those event into an interaction event.

built-in recorder has a matcher called `PatterMatcher`, match the pattern of event group and compose it to a single interaction event.

It has three period to process a single event from observer:
- actionBeforeCollectStep:  
check if new event will cause the previous event group to be emitted;  
or the event should be ignored in this period;  
or the event should not be processed anymore.
- actionWhileCollectStep:  
check if the event need to be collected;  
or the event should be ignored in this period;  
or the event should not be processed anymore.
- actionAfterCollectStep:  
check if the event group need to be emitted after collect event;  
or the event should be ignored in this period;  
or the event should not be processed anymore.

and a group of pattern to match to event group:  
- CLICK
- DRAG
- SCROLL
- TEXTING
- UNKNOWN
### 3.recorder

recorder is the bridge between observer and matcher, it will collect event from observer and send it to matcher. And will get interaction composed by matcher. Also, it handle the communication to outside.  
A recorder could have multiple observer at the same time, but only one matcher.

## extension

observer and matcher can be extended to handle more event.
use `recorder.extendAction` to add extra observer and extend matcher.

detail to see [link](./docs/extends.md)
