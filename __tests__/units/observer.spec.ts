import { EventObserver } from '../../src/observers';
describe('Observer', () => {
  it('Create an instance', () => {
    const obs = new EventObserver(window, document);
    expect(obs).not.toBeNull();
  });
});
