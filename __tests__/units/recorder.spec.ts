import { Recorder } from '../../src/index';
describe('Recorder', () => {
  it('Can be initialize by minimal required parameter', () => {
    expect(
      new Recorder({
        win: window,
        doc: document,
        onEmit: () => void 0,
      }),
    ).not.toBeNull();
  });
});
