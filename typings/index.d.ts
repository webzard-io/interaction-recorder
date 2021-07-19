export * as Matcher from './matcher';
export * as Observer from './observers';
export * as Types from './types';
import * as BaseRecorder from './recorder';
import * as BuiltInRecorder from './builtin';
export declare const Recorder: {
    Recorder: typeof BaseRecorder;
    BuiltInRecorder: typeof BuiltInRecorder;
};
import * as UtilsFn from './util/fn';
import * as Throttler from './util/throttler';
import * as Metaquerier from './util/metaquerier';
import * as EntryReader from './util/entry-reader';
export declare const Utils: {
    UtilsFn: typeof UtilsFn;
    Throttler: typeof Throttler;
    Metaquerier: typeof Metaquerier;
    EntryReader: typeof EntryReader;
};
