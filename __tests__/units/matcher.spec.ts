import { PatternMatcher } from '../../src/matcher';
describe('Matcher', () => {
  it('Create an instance', () => {
    const matcher = new PatternMatcher();
    expect(matcher).not.toBeNull();
  });
});
