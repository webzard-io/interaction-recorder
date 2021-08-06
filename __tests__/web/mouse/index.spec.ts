import { Page } from 'puppeteer/lib/types';
import { IsolatedWorld } from '../isolatedWorld';

describe('mouse matcher', () => {
  let isolatedWorld: IsolatedWorld;
  beforeEach(async () => {
    isolatedWorld = new IsolatedWorld(page as unknown as Page);
    await page.goto(
      'https://dvcs.w3.org/hg/d4e/raw-file/tip/mouse-event-test.html',
      {
        waitUntil: 'domcontentloaded',
      },
    );
    await isolatedWorld.injectRecorder();
    await isolatedWorld.useFakeDateTime(100);
    await isolatedWorld.createRecorder();
  });

  it('should not match normal mousemove', async () => {
    await page.mouse.move(400, 400, { steps: 10 });
    const curr = await isolatedWorld.retrieveCurrentEvent();
    expect(curr).toMatchInlineSnapshot(`Object {}`);
  });

  it('should match dragging mousemove', async () => {
    await page.mouse.move(0, 0);
    await page.mouse.down();
    await page.mouse.move(400, 400, { steps: 10 });
    await page.mouse.up();
    const curr = await isolatedWorld.retrieveCurrentEvent();
    expect(curr.events).toMatchInlineSnapshot(`
      Array [
        Object {
          "button": 0,
          "buttons": 1,
          "clientX": 0,
          "clientY": 0,
          "modifiers": Object {},
          "screenX": 0,
          "screenY": 0,
          "timestamp": 500,
          "type": "mousedown",
        },
        Object {
          "positions": Array [
            Object {
              "clientX": 40,
              "clientY": 40,
              "screenX": 40,
              "screenY": 40,
              "timeOffset": 100,
            },
            Object {
              "clientX": 80,
              "clientY": 80,
              "screenX": 80,
              "screenY": 80,
              "timeOffset": 400,
            },
          ],
          "timestamp": 800,
          "type": "mousemove",
        },
        Object {
          "positions": Array [
            Object {
              "clientX": 120,
              "clientY": 120,
              "screenX": 120,
              "screenY": 120,
              "timeOffset": 100,
            },
            Object {
              "clientX": 160,
              "clientY": 160,
              "screenX": 160,
              "screenY": 160,
              "timeOffset": 400,
            },
          ],
          "timestamp": 1500,
          "type": "mousemove",
        },
        Object {
          "positions": Array [
            Object {
              "clientX": 200,
              "clientY": 200,
              "screenX": 200,
              "screenY": 200,
              "timeOffset": 100,
            },
            Object {
              "clientX": 240,
              "clientY": 240,
              "screenX": 240,
              "screenY": 240,
              "timeOffset": 400,
            },
          ],
          "timestamp": 2200,
          "type": "mousemove",
        },
        Object {
          "positions": Array [
            Object {
              "clientX": 280,
              "clientY": 280,
              "screenX": 280,
              "screenY": 280,
              "timeOffset": 100,
            },
            Object {
              "clientX": 320,
              "clientY": 320,
              "screenX": 320,
              "screenY": 320,
              "timeOffset": 400,
            },
          ],
          "timestamp": 2900,
          "type": "mousemove",
        },
        Object {
          "positions": Array [
            Object {
              "clientX": 360,
              "clientY": 360,
              "screenX": 360,
              "screenY": 360,
              "timeOffset": 100,
            },
            Object {
              "clientX": 400,
              "clientY": 400,
              "screenX": 400,
              "screenY": 400,
              "timeOffset": 400,
            },
          ],
          "timestamp": 3600,
          "type": "mousemove",
        },
        Object {
          "button": 0,
          "buttons": 0,
          "clientX": 400,
          "clientY": 400,
          "modifiers": Object {},
          "screenX": 400,
          "screenY": 400,
          "timestamp": 4200,
          "type": "mouseup",
        },
        Object {
          "button": 0,
          "buttons": 0,
          "clientX": 400,
          "clientY": 400,
          "modifiers": Object {},
          "screenX": 400,
          "screenY": 400,
          "timestamp": 4300,
          "type": "click",
        },
      ]
    `);
    expect(curr.target).toMatchInlineSnapshot(
      {
        id: expect.any(String),
      },
      `
      Object {
        "attributes": Object {
          "xmlns": "http://www.w3.org/1999/xhtml",
        },
        "id": Any<String>,
        "tagName": "HTML",
      }
    `,
    );
    expect(curr.type).toMatchInlineSnapshot(`"DRAG"`);
  });

  afterEach(async () => {
    await page.reload();
  });
});
