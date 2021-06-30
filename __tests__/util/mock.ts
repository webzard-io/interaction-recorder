import { EventEmitter2 } from 'eventemitter2';
import { mocked } from 'ts-jest/utils';
import { IMatcher } from '../../src/matcher';
import { AbstractObserver } from '../../src/observers';

const emptyFn = () => void 0;

export const getMockedObserver = () => {
  return mocked<any>({
    name: 'mocked',
    start: emptyFn,
    stop: emptyFn,
    suspend: emptyFn,
    emitter: new EventEmitter2(),
  }) as AbstractObserver;
};

export const getMockedMatcher = () => {
  return mocked<IMatcher>({
    start: emptyFn,
    suspend: emptyFn,
    stop: emptyFn,
    extendAction: emptyFn,
    removeAction: emptyFn,
  });
};
