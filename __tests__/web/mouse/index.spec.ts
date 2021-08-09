import { Page } from 'puppeteer/lib/types';
import { IsolatedWorld } from '../isolatedWorld';
import path from 'path';
import 'jest-extended';

describe('mouse matcher', () => {
  let isolatedWorld: IsolatedWorld;
  beforeEach(async () => {
    isolatedWorld = new IsolatedWorld(page as unknown as Page);
    await page.goto(path.resolve(__dirname, 'mouse.html'), {
      waitUntil: 'domcontentloaded',
    });
    await isolatedWorld.injectRecorder();
    await isolatedWorld.createRecorder();
  });

  it('should not match normal mousemove', async () => {
    await isolatedWorld.useFakeDateTime(100);
    await page.mouse.move(400, 400, { steps: 10 });
    const curr = await isolatedWorld.retrieveCurrentEvent();
    expect(curr).toMatchSnapshot();
  });

  it('should match dragging mousemove', async () => {
    await isolatedWorld.useFakeDateTime(100);
    await page.mouse.move(0, 0);
    await page.mouse.down();
    await page.mouse.move(400, 400, { steps: 10 });
    await page.mouse.up();
    const curr = await isolatedWorld.retrieveCurrentEvent();
    expect(curr.events).toMatchSnapshot();
    expect(curr.target).toMatchSnapshot({
      id: expect.any(String),
    });
    expect(curr.type).toMatchSnapshot();
  });

  it('should match dblclick', async () => {
    await isolatedWorld.useFakeDateTime(1);
    await page.mouse.click(0, 0);
    let curr = await isolatedWorld.retrieveCurrentEvent();
    expect(curr.events).toMatchSnapshot();
    expect(curr.target).toMatchSnapshot({
      id: expect.any(String),
    });
    expect(curr.type).toEqualCaseInsensitive('click');
    await page.mouse.click(0, 0);
    curr = await isolatedWorld.retrieveCurrentEvent();
    expect(curr.events).toMatchSnapshot();
    expect(curr.target).toMatchSnapshot({
      id: expect.any(String),
    });
    expect(curr.type).toEqualCaseInsensitive('dblclick');
  });

  it('should not match two sibling click with long time period', async () => {
    await isolatedWorld.useFakeDateTime(100);
    await page.mouse.click(0, 0);
    let curr = await isolatedWorld.retrieveCurrentEvent();
    expect(curr.events).toMatchSnapshot();
    expect(curr.target).toMatchSnapshot({
      id: expect.any(String),
    });
    expect(curr.type).toEqualCaseInsensitive('click');
    await page.mouse.click(0, 0);
    curr = await isolatedWorld.retrieveCurrentEvent();
    expect(curr.events).toMatchSnapshot();
    expect(curr.target).toMatchSnapshot({
      id: expect.any(String),
    });
    expect(curr.type).toEqualCaseInsensitive('click');
  });

  it('should match right click', async () => {
    await isolatedWorld.useFakeDateTime(100);
    await page.mouse.click(0, 0, {
      button: 'right',
    });
    const curr = await isolatedWorld.retrieveCurrentEvent();
    expect(curr.events).toMatchSnapshot();
    expect(curr.target).toMatchSnapshot({
      id: expect.any(String),
    });
    expect(curr.type).toEqualCaseInsensitive('right_click');
  });

  it('should not match dblclick of right click', async () => {
    await isolatedWorld.useFakeDateTime(1);
    await page.mouse.click(0, 0, {
      button: 'right',
    });
    let curr = await isolatedWorld.retrieveCurrentEvent();
    expect(curr.events).toMatchSnapshot();
    expect(curr.target).toMatchSnapshot({
      id: expect.any(String),
    });
    expect(curr.type).toEqualCaseInsensitive('right_click');
    await page.mouse.click(0, 0, {
      button: 'right',
    });
    curr = await isolatedWorld.retrieveCurrentEvent();
    expect(curr.events).toMatchSnapshot();
    expect(curr.target).toMatchSnapshot({
      id: expect.any(String),
    });
    expect(curr.type).toEqualCaseInsensitive('right_click');
  });
});
