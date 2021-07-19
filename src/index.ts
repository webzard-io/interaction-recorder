export * as Matcher from './matcher';
export * as Observer from './observers';
export * as Types from './types';
import * as BaseRecorder from './recorder';
import * as BuiltInRecorder from './builtin';

export const Recorder = {
  Recorder: BaseRecorder,
  BuiltInRecorder,
};

import * as UtilsFn from './util/fn';
import * as Throttler from './util/throttler';
import * as Metaquerier from './util/metaquerier';
import * as EntryReader from './util/entry-reader';

export const Utils = { UtilsFn, Throttler, Metaquerier, EntryReader };
