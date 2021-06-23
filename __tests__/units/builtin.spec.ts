import { SimpleRecorder } from '../../src/index';
let recorder: SimpleRecorder;
describe('Built-in recorder', () => {
  beforeEach(() => {
    recorder = new SimpleRecorder(window, { onEmit: () => void 0 });
  });
  it('should create an instance', () => {
    expect(recorder).not.toBeFalsy();
  });

  it('should able to get observer', () => {
    expect(recorder.observer).not.toBeFalsy();
  });

  it('should able to get recorder', () => {
    expect(recorder.recorder).not.toBeFalsy();
  });
});
