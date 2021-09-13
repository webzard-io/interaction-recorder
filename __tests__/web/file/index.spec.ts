import { Page } from 'puppeteer/lib/types';
import { IsolatedWorld } from '../isolatedWorld';
import path from 'path';
import 'jest-extended';

describe('file input', () => {
  let isolatedWorld: IsolatedWorld;
  beforeEach(async () => {
    isolatedWorld = new IsolatedWorld(page as unknown as Page);
    await page.goto(path.resolve(__dirname, 'file.html'), {
      waitUntil: 'domcontentloaded',
    });
    await isolatedWorld.injectRecorder();
    await isolatedWorld.createRecorder();
  });

  it('should handle file_input', async () => {
    await isolatedWorld.useFakeDateTime(100);
    const file_input = await page.$('input');
    // file_input?.click();
    await file_input?.uploadFile(path.resolve(__dirname, 'file.html'));
    const curr = await isolatedWorld.retrieveCurrentEvent();
    expect(curr.events).toMatchSnapshot();
    expect(curr.target).toMatchSnapshot({
      id: expect.any(String),
    });
    expect(curr.type).toEqualCaseInsensitive('browse_file');
  });

  // this version of cdp cannot drop file
  xit('should handle drop file', async () => {
    await isolatedWorld.useFakeDateTime(100);
    const file_input = await page.$('input');
    const bouding = await file_input?.boundingBox();
    isolatedWorld.client.send('Input.dispatchDragEvent', {
      type: 'drop',
      x: bouding!.x + 10,
      y: bouding!.y + bouding!.height / 2,
      data: {
        items: [],
        dragOperationsMask: 19,
      },
    });
    const curr = await isolatedWorld.retrieveCurrentEvent();
    expect(curr.events).toMatchSnapshot();
    expect(curr.target).toMatchSnapshot({
      id: expect.any(String),
    });
    expect(curr.type).toEqualCaseInsensitive('browse_file');
  });
});
