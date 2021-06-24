import { EventEmitter2 } from 'eventemitter2';
import { mocked } from 'ts-jest/utils';
import { IMatcher } from '../../src/matcher';
import { IObserver } from '../../src/observers';

const emptyFn = () => void 0;

export const getMockedObserver = () => {
  return mocked<IObserver>({
    name: 'mocked',
    start: emptyFn,
    stop: emptyFn,
    suspend: emptyFn,
    emitter: new EventEmitter2(),
  });
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
