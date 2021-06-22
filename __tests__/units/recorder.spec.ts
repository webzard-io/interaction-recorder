import { PatternMatcher } from '../../src/matcher';
import { Recorder } from '../../src/recorder';
describe('Observer', () => {
  it('Create an instance', () => {
    const recorder = new Recorder({
      matcher: new PatternMatcher(),
      onEmit: () => void 0,
    });
    expect(recorder).not.toBeNull();
  });
});
