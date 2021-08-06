import { Page } from 'puppeteer/lib/types';
import { IsolatedWorld } from '../isolatedWorld';

describe('keyboard', () => {
  let isolatedWorld: IsolatedWorld;
  beforeEach(async () => {
    isolatedWorld = new IsolatedWorld(page as unknown as Page);
    await page.goto(
      'https://dvcs.w3.org/hg/d4e/raw-file/tip/key-event-test.html',
      {
        waitUntil: 'domcontentloaded',
      },
    );
    await isolatedWorld.injectRecorder();
    await isolatedWorld.useFakeDateTime(100);
    await isolatedWorld.createRecorder();
  });

  it('should match texting event', async () => {
    await (await page.$('input'))?.focus();
    await page.keyboard.type('12345');
    // expect record keyboard event and match type texting;
    const curr = await isolatedWorld.retrieveCurrentEvent();
    expect(curr.events).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "Digit1",
          "key": "1",
          "keyCode": 49,
          "modifiers": Object {},
          "timestamp": 100,
          "type": "keydown",
        },
        Object {
          "code": "Digit1",
          "key": "1",
          "keyCode": 49,
          "modifiers": Object {},
          "timestamp": 200,
          "type": "keypress",
        },
        Object {
          "data": "1",
          "timestamp": 300,
          "type": "text_input",
          "value": "",
        },
        Object {
          "timestamp": 400,
          "type": "text_change",
          "value": "1",
        },
        Object {
          "code": "Digit1",
          "key": "1",
          "keyCode": 49,
          "modifiers": Object {},
          "timestamp": 500,
          "type": "keyup",
        },
        Object {
          "code": "Digit2",
          "key": "2",
          "keyCode": 50,
          "modifiers": Object {},
          "timestamp": 600,
          "type": "keydown",
        },
        Object {
          "code": "Digit2",
          "key": "2",
          "keyCode": 50,
          "modifiers": Object {},
          "timestamp": 700,
          "type": "keypress",
        },
        Object {
          "data": "2",
          "timestamp": 800,
          "type": "text_input",
          "value": "",
        },
        Object {
          "timestamp": 900,
          "type": "text_change",
          "value": "12",
        },
        Object {
          "code": "Digit2",
          "key": "2",
          "keyCode": 50,
          "modifiers": Object {},
          "timestamp": 1000,
          "type": "keyup",
        },
        Object {
          "code": "Digit3",
          "key": "3",
          "keyCode": 51,
          "modifiers": Object {},
          "timestamp": 1100,
          "type": "keydown",
        },
        Object {
          "code": "Digit3",
          "key": "3",
          "keyCode": 51,
          "modifiers": Object {},
          "timestamp": 1200,
          "type": "keypress",
        },
        Object {
          "data": "3",
          "timestamp": 1300,
          "type": "text_input",
          "value": "",
        },
        Object {
          "timestamp": 1400,
          "type": "text_change",
          "value": "123",
        },
        Object {
          "code": "Digit3",
          "key": "3",
          "keyCode": 51,
          "modifiers": Object {},
          "timestamp": 1500,
          "type": "keyup",
        },
        Object {
          "code": "Digit4",
          "key": "4",
          "keyCode": 52,
          "modifiers": Object {},
          "timestamp": 1600,
          "type": "keydown",
        },
        Object {
          "code": "Digit4",
          "key": "4",
          "keyCode": 52,
          "modifiers": Object {},
          "timestamp": 1700,
          "type": "keypress",
        },
        Object {
          "data": "4",
          "timestamp": 1800,
          "type": "text_input",
          "value": "",
        },
        Object {
          "timestamp": 1900,
          "type": "text_change",
          "value": "1234",
        },
        Object {
          "code": "Digit4",
          "key": "4",
          "keyCode": 52,
          "modifiers": Object {},
          "timestamp": 2000,
          "type": "keyup",
        },
        Object {
          "code": "Digit5",
          "key": "5",
          "keyCode": 53,
          "modifiers": Object {},
          "timestamp": 2100,
          "type": "keydown",
        },
        Object {
          "code": "Digit5",
          "key": "5",
          "keyCode": 53,
          "modifiers": Object {},
          "timestamp": 2200,
          "type": "keypress",
        },
        Object {
          "data": "5",
          "timestamp": 2300,
          "type": "text_input",
          "value": "",
        },
        Object {
          "timestamp": 2400,
          "type": "text_change",
          "value": "12345",
        },
        Object {
          "code": "Digit5",
          "key": "5",
          "keyCode": 53,
          "modifiers": Object {},
          "timestamp": 2500,
          "type": "keyup",
        },
      ]
    `);
    expect(curr.type).toMatchInlineSnapshot(`"TEXT"`);
    expect(curr.target).toMatchInlineSnapshot(
      {
        id: expect.any(String),
      },
      `
      Object {
        "attributes": Object {
          "autofocus": "",
          "id": "input",
          "size": "80",
          "type": "text",
        },
        "id": Any<String>,
        "tagName": "INPUT",
      }
    `,
    );
    expect((await isolatedWorld.retrieveFinishedEvent()).length).toBe(0);
    await page.mouse.click(0, 0);
    // expect event was emitted and equal
    const finished2 = await isolatedWorld.retrieveFinishedEvent();
    expect(finished2.length).toBe(1);
    expect(finished2[0]).toEqual(curr);
  });

  xit('record texting event with non-normal key', async () => {
    const input = await page.$('input');
    await input?.type('ĉçäâàëêéèôöØøœæ');
    // expect record keyboard event and match type texting;
    const curr = await isolatedWorld.retrieveCurrentEvent();
    expect(curr.events).toMatchInlineSnapshot(`
      Array [
        Object {
          "data": "ĉ",
          "timestamp": 100,
          "type": "text_input",
          "value": "",
        },
        Object {
          "timestamp": 200,
          "type": "text_change",
          "value": "ĉ",
        },
        Object {
          "data": "ç",
          "timestamp": 300,
          "type": "text_input",
          "value": "",
        },
        Object {
          "timestamp": 400,
          "type": "text_change",
          "value": "ĉç",
        },
        Object {
          "data": "ä",
          "timestamp": 500,
          "type": "text_input",
          "value": "",
        },
        Object {
          "timestamp": 600,
          "type": "text_change",
          "value": "ĉçä",
        },
        Object {
          "data": "â",
          "timestamp": 700,
          "type": "text_input",
          "value": "",
        },
        Object {
          "timestamp": 800,
          "type": "text_change",
          "value": "ĉçäâ",
        },
        Object {
          "data": "à",
          "timestamp": 900,
          "type": "text_input",
          "value": "",
        },
        Object {
          "timestamp": 1000,
          "type": "text_change",
          "value": "ĉçäâà",
        },
        Object {
          "data": "ë",
          "timestamp": 1100,
          "type": "text_input",
          "value": "",
        },
        Object {
          "timestamp": 1200,
          "type": "text_change",
          "value": "ĉçäâàë",
        },
        Object {
          "data": "ê",
          "timestamp": 1300,
          "type": "text_input",
          "value": "",
        },
        Object {
          "timestamp": 1400,
          "type": "text_change",
          "value": "ĉçäâàëê",
        },
        Object {
          "data": "é",
          "timestamp": 1500,
          "type": "text_input",
          "value": "",
        },
        Object {
          "timestamp": 1600,
          "type": "text_change",
          "value": "ĉçäâàëêé",
        },
        Object {
          "data": "è",
          "timestamp": 1700,
          "type": "text_input",
          "value": "",
        },
        Object {
          "timestamp": 1800,
          "type": "text_change",
          "value": "ĉçäâàëêéè",
        },
        Object {
          "data": "ô",
          "timestamp": 1900,
          "type": "text_input",
          "value": "",
        },
        Object {
          "timestamp": 2000,
          "type": "text_change",
          "value": "ĉçäâàëêéèô",
        },
        Object {
          "data": "ö",
          "timestamp": 2100,
          "type": "text_input",
          "value": "",
        },
        Object {
          "timestamp": 2200,
          "type": "text_change",
          "value": "ĉçäâàëêéèôö",
        },
        Object {
          "data": "Ø",
          "timestamp": 2300,
          "type": "text_input",
          "value": "",
        },
        Object {
          "timestamp": 2400,
          "type": "text_change",
          "value": "ĉçäâàëêéèôöØ",
        },
        Object {
          "data": "ø",
          "timestamp": 2500,
          "type": "text_input",
          "value": "",
        },
        Object {
          "timestamp": 2600,
          "type": "text_change",
          "value": "ĉçäâàëêéèôöØø",
        },
        Object {
          "data": "œ",
          "timestamp": 2700,
          "type": "text_input",
          "value": "",
        },
        Object {
          "timestamp": 2800,
          "type": "text_change",
          "value": "ĉçäâàëêéèôöØøœ",
        },
        Object {
          "data": "æ",
          "timestamp": 2900,
          "type": "text_input",
          "value": "",
        },
        Object {
          "timestamp": 3000,
          "type": "text_change",
          "value": "ĉçäâàëêéèôöØøœæ",
        },
      ]
    `);
    expect(curr.type).toMatchInlineSnapshot(`"TEXT"`);
    expect(curr.target).toMatchInlineSnapshot(
      {
        id: expect.any(String),
      },
      `
      Object {
        "attributes": Object {
          "autofocus": "",
          "id": "input",
          "size": "80",
          "type": "text",
        },
        "id": Any<String>,
        "tagName": "INPUT",
      }
    `,
    );
    expect((await isolatedWorld.retrieveFinishedEvent()).length).toBe(0);
    await input?.click();
    // expect event was emitted and equal
    const finished2 = await isolatedWorld.retrieveFinishedEvent();
    expect(finished2.length).toBe(1);
    expect(finished2[0]).toEqual(curr);
    expect(input).toBeTruthy();
  });

  it('shoud match keypress event', async () => {
    const body = await page.$('body');
    // blur the default focus on input element;
    await body?.click();
    await body?.press('A');
    const result = await isolatedWorld.retrieveCurrentEvent();
    expect(result.type).toMatchInlineSnapshot(`"TEXT"`);
    expect(result.events).toMatchInlineSnapshot(`
      Array [
        Object {
          "code": "KeyA",
          "key": "A",
          "keyCode": 65,
          "modifiers": Object {},
          "timestamp": 900,
          "type": "keydown",
        },
        Object {
          "code": "KeyA",
          "key": "A",
          "keyCode": 65,
          "modifiers": Object {},
          "timestamp": 1000,
          "type": "keypress",
        },
        Object {
          "data": "A",
          "timestamp": 1100,
          "type": "text_input",
          "value": "",
        },
        Object {
          "timestamp": 1200,
          "type": "text_change",
          "value": "A",
        },
        Object {
          "code": "KeyA",
          "key": "A",
          "keyCode": 65,
          "modifiers": Object {},
          "timestamp": 1300,
          "type": "keyup",
        },
      ]
    `);
    expect(result.target).toMatchInlineSnapshot(
      {
        id: expect.any(String),
      },
      `
      Object {
        "attributes": Object {
          "autofocus": "",
          "id": "input",
          "size": "80",
          "type": "text",
        },
        "id": Any<String>,
        "tagName": "INPUT",
      }
    `,
    );
    expect(true).toBeTruthy();
  });
});
