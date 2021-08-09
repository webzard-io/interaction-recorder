import { Page } from 'puppeteer/lib/types';
import { IsolatedWorld } from '../isolatedWorld';
import path from 'path';
import 'jest-extended';

describe('scroll', () => {
  let isolatedWorld: IsolatedWorld;
  beforeEach(async () => {
    isolatedWorld = new IsolatedWorld(page as unknown as Page);
    await page.goto(path.resolve(__dirname, 'scroll.html'), {
      waitUntil: 'domcontentloaded',
    });
    await isolatedWorld.injectRecorder();
    await isolatedWorld.createRecorder();
  });

  it('should match wheel scroll', async () => {
    await isolatedWorld.useFakeDateTime(100);
    const container = await page.$('#container');
    await container?.click();
    await page.mouse.wheel({
      deltaX: 100,
      deltaY: 100,
    });
    // wait for throttle
    await page.waitForTimeout(500);

    const curr = await isolatedWorld.retrieveCurrentEvent();
    expect(curr.events).toMatchSnapshot();
    expect(curr.target).toMatchSnapshot({
      id: expect.any(String),
    });
    expect(curr.type).toEqualCaseInsensitive('scroll');
  });

  it('should match drag scroll bar scroll', async () => {
    await isolatedWorld.useFakeDateTime(100);
    // mock interaction dragging scroll bar
    await page.mouse.move(95, 35);
    await page.mouse.down();
    await page.mouse.move(95, 60);
    await page.mouse.up();
    // wait for throttle
    await page.waitForTimeout(500);

    const curr = await isolatedWorld.retrieveCurrentEvent();
    expect(curr.events).toMatchSnapshot();
    expect(curr.target).toMatchSnapshot({
      id: expect.any(String),
    });
    expect(curr.type).toEqualCaseInsensitive('scroll');
  });
});
