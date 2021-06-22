import { init } from '../../src';
describe('init utils test env', () => {
  it('first test', () => {
    expect(init()).not.toBeNull();
  })
})