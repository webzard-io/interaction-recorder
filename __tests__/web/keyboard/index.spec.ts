import { Page } from 'puppeteer/lib/types';
import { IsolatedWorld } from '../isolatedWorld';
import path from 'path';
import 'jest-extended';

describe('keyboard', () => {
  let isolatedWorld: IsolatedWorld;
  beforeEach(async () => {
    isolatedWorld = new IsolatedWorld(page as unknown as Page);
    await page.goto(path.resolve(__dirname, 'keyboard.html'), {
      waitUntil: 'domcontentloaded',
    });
    await isolatedWorld.injectRecorder();
    await isolatedWorld.createRecorder();
  });

  it('should match texting event', async () => {
    await isolatedWorld.useFakeDateTime(100);
    await (await page.$('input'))?.focus();
    await page.keyboard.type('12345');
    // expect record keyboard event and match type texting;
    const curr = await isolatedWorld.retrieveCurrentEvent();
    expect(curr.events).toMatchSnapshot();
    expect(curr.type).toEqualCaseInsensitive('text');
    expect(curr.target).toMatchSnapshot({
      id: expect.any(String),
    });
    expect((await isolatedWorld.retrieveFinishedEvent()).length).toBe(0);
    await page.mouse.click(0, 0);
    // expect event was emitted and equal
    const finished2 = await isolatedWorld.retrieveFinishedEvent();
    expect(finished2.length).toBe(1);
    expect(finished2[0]).toEqual(curr);
  });

  xit('record texting event with non-normal key', async () => {
    await isolatedWorld.useFakeDateTime(100);
    const input = await page.$('input');
    await input?.type('ĉçäâàëêéèôöØøœæ');
    // expect record keyboard event and match type texting;
    const curr = await isolatedWorld.retrieveCurrentEvent();
    expect(curr.events).toMatchSnapshot();
    expect(curr.type).toEqualCaseInsensitive('text');
    expect(curr.target).toMatchSnapshot({
      id: expect.any(String),
    });
    expect((await isolatedWorld.retrieveFinishedEvent()).length).toBe(0);
    await input?.click();
    // expect event was emitted and equal
    const finished2 = await isolatedWorld.retrieveFinishedEvent();
    expect(finished2.length).toBe(1);
    expect(finished2[0]).toEqual(curr);
    expect(input).toBeTruthy();
  });

  it('shoud match keypress event', async () => {
    await isolatedWorld.useFakeDateTime(100);
    await page.$eval('input', (e) => (e as HTMLElement).blur());
    await page.keyboard.type('A');
    const result = await isolatedWorld.retrieveCurrentEvent();
    expect(result.type).toEqualCaseInsensitive('keypress');
    expect(result.events).toMatchSnapshot();
    expect(result.target).toMatchSnapshot({
      id: expect.any(String),
    });
    expect(true).toBeTruthy();
  });
});
