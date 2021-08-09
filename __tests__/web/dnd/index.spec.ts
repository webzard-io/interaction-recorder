import { CDPSession, ElementHandle, Page } from 'puppeteer';
import { IsolatedWorld } from '../isolatedWorld';
import path from 'path';
import 'jest-extended';

const drag = async (
  source: ElementHandle<Element>,
  target: ElementHandle<Element>,
  session: CDPSession,
) => {
  const sourcebox = await source?.boundingBox();
  const targetbox = await target?.boundingBox();

  await source.hover();
  await session.send('Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    x: sourcebox!.x + sourcebox!.width / 2,
    y: sourcebox!.y + sourcebox!.height / 2,
    button: 'left',
    buttons: 1,
  });

  await session.send('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x: sourcebox!.x + sourcebox!.width / 2,
    y: sourcebox!.y + sourcebox!.height / 2,
    button: 'left',
    buttons: 1,
  });

  await page.waitForTimeout(100);

  for (let i = 1; i < 5; i++) {
    const x =
      sourcebox!.x +
      sourcebox!.width / 2 +
      ((targetbox!.x +
        targetbox!.width / 2 -
        (sourcebox!.x + sourcebox!.width / 2)) *
        i) /
        5;
    const y =
      sourcebox!.y +
      sourcebox!.height / 2 +
      ((targetbox!.y +
        targetbox!.height / 2 -
        (sourcebox!.y + sourcebox!.height / 2)) *
        i) /
        5;
    await session.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x,
      y,
      button: 'left',
      buttons: 1,
    });

    await page.waitForTimeout(100);
  }

  await session.send('Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    x: targetbox!.x + targetbox!.width / 2,
    y: targetbox!.y + targetbox!.height / 2,
    button: 'left',
    buttons: 1,
  });

  await page.waitForTimeout(100);

  await session.send('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x: targetbox!.x + targetbox!.width / 2,
    y: targetbox!.y + targetbox!.height / 2,
    button: 'left',
    buttons: 1,
  });
};
// drag is not work well in puppeteer, not execute it now.
xdescribe('dragging', () => {
  let isolatedWorld: IsolatedWorld;
  beforeEach(async () => {
    isolatedWorld = new IsolatedWorld(page as unknown as Page);
    await page.goto(path.resolve(__dirname, 'dnd.html'), {
      waitUntil: 'domcontentloaded',
    });
    await isolatedWorld.injectRecorder();
    await isolatedWorld.createRecorder();
  });

  xit('should match sucessfully drag and drop', async () => {
    await isolatedWorld.useFakeDateTime(100);
    const source = await (page as unknown as Page).$('.source#s1');
    const target = await (page as unknown as Page).$('.target#allowed');
    await drag(source!, target!, isolatedWorld.client);
    await page.waitForTimeout(500);
    const curr = await isolatedWorld.retrieveCurrentEvent();
    expect(curr.events).toMatchSnapshot();
    expect(curr.target).toMatchSnapshot({
      id: expect.any(String),
    });
    expect(curr.type).toEqualCaseInsensitive('drag');
  });

  xit('should matche failed darg and drop', async () => {
    await isolatedWorld.useFakeDateTime(100);
    const source = await (page as unknown as Page).$('.source#s1');
    const target = await (page as unknown as Page).$('.target#forbidden');
    await drag(source!, target!, isolatedWorld.client);
    await page.waitForTimeout(500);

    const curr = await isolatedWorld.retrieveCurrentEvent();
    expect(curr.events).toMatchSnapshot();
    expect(curr.target).toMatchSnapshot({
      id: expect.any(String),
    });
    expect(curr.type).toEqualCaseInsensitive('drag');
  });
});
