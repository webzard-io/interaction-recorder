import { SimpleRecorder } from '../../src/index';
let recorder: SimpleRecorder;
describe('Built-in recorder', () => {
  beforeEach(() => {
    recorder = new SimpleRecorder(window, { onEmit: () => void 0 });
  });
  it('should create an instance', () => {
    expect(recorder).not.toBeFalsy();
  });
});
