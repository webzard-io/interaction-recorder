import { Page, CDPSession, Protocol } from 'puppeteer/lib/types';
import * as fs from 'fs';
import * as path from 'path';

// throw exception when
const createEvaluateResponseProxy = () =>
  new Proxy<{
    res: Protocol.Runtime.EvaluateResponse | undefined;
  }>(
    {
      res: undefined,
    },
    {
      get: (curr) => curr.res,
      set: (curr, prop, newRes: Protocol.Runtime.EvaluateResponse) => {
        // to catch exception thrown by context;
        if (newRes.result.subtype === 'error') {
          throw new Error(newRes.result.value);
        }
        curr.res = newRes;
        return true;
      },
    },
  );

export class IsolatedWorld {
  private client: CDPSession;
  private isolatedId: Promise<number>;
  private recorderInjected: Promise<boolean>;
  private recorderResolver!: (flag: boolean) => void;
  constructor(page: Page) {
    const frame = page.mainFrame();
    this.client = frame._frameManager._client;
    let resolver: (n: number) => void;

    this.isolatedId = new Promise<number>((res) => {
      resolver = res;
    });

    this.recorderInjected = new Promise<boolean>((res) => {
      this.recorderResolver = res;
    });

    const handler = (event: Protocol.Runtime.ExecutionContextCreatedEvent) => {
      const { id, name } = event.context;
      if (name === '__puppeteer_utility_world__') {
        resolver(id);
        this.client.off('Runtime.executionContextCreated', handler);
      }
    };
    this.client.on('Runtime.executionContextCreated', handler);
  }

  // inject recorder to element;
  public async injectRecorder() {
    const id = await this.isolatedId;
    const expression = fs.readFileSync(
      path.resolve('./', 'build/index.browser.js'),
      'utf-8',
    );

    try {
      const resultProxy = createEvaluateResponseProxy();
      resultProxy.res = await this.client.send('Runtime.evaluate', {
        expression: expression,
        contextId: id,
      });
      this.recorderResolver(true);
    } catch (e) {
      console.error(e);
    }
  }

  public async createRecorder() {
    const id = await this.isolatedId;
    // wait for recorder resolver was actived
    await this.recorderInjected;
    // we can also try use exposedFunction to make a custom event listener for event.
    try {
      const resultProxy = createEvaluateResponseProxy();

      resultProxy.res = await this.client.send('Runtime.evaluate', {
        expression: `
            window['__currentStep'] = {};
            window['__finishedEvent'] = [];
            window.observer = new recorder.InteractionRecorder(window,{
              onNewStep: (step)=> window['__currentStep'] = step,
              onUpdateStep: (step)=> window['__currentStep'] = step,
              onEndStep: (step) => window['__finishedEvent'].push(step),
            })
            window.observer.start();
          `,
        contextId: id,
      });
    } catch (e) {
      console.error(e);
    }
  }

  // get finished event;
  public async retrieveFinishedEvent() {
    const id = await this.isolatedId;
    try {
      const resultProxy = createEvaluateResponseProxy();
      resultProxy.res = await this.client.send('Runtime.evaluate', {
        expression: `JSON.stringify(window['__finishedEvent'])`,
        contextId: id,
      });
      return JSON.parse(resultProxy.res.result.value);
    } catch (e) {
      console.error(e);
    }
  }

  // get current event;
  public async retrieveCurrentEvent() {
    const id = await this.isolatedId;

    try {
      const resultProxy = createEvaluateResponseProxy();

      resultProxy.res = await this.client.send('Runtime.evaluate', {
        expression: `JSON.stringify(window['__currentStep'])`,
        contextId: id,
      });
      const result = resultProxy.res.result;
      if (result.type === 'undefined') {
        return undefined;
      } else {
        return JSON.parse(resultProxy.res.result.value);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // create a fake Date constructor, it will get static time if user doesn't specified timestamp;
  public async useFakeDateTime(interval = 500) {
    const id = await this.isolatedId;
    try {
      const resultProxy = createEvaluateResponseProxy();
      resultProxy.res = await this.client.send('Runtime.evaluate', {
        expression: `
          window['__pDate'] = Date;
          window['__fakeTime'] = 0;
          window['__pNow'] = Date.now;
          Date = function(...args){
            if(args.length){
              return new __pDate(...args);
            }else{
              __fakeTime += ${interval};
              return new __pDate(__fakeTime)
            }
          }
          Object.getOwnPropertyNames(__pDate).slice(3).forEach((prop)=>{
            Date[prop] = __pDate[prop]
          });
          Date.now = ()=>{
            __fakeTime += ${interval};
            return __fakeTime;
          }
        `,
        contextId: id,
      });
      return;
    } catch (e) {
      console.error(e);
    }
  }

  public async useRealDateTime() {
    const id = await this.isolatedId;
    try {
      const resultProxy = createEvaluateResponseProxy();
      resultProxy.res = await this.client.send('Runtime.evaluate', {
        expression: `
          Date = __pDate;
        `,
        contextId: id,
      });
      return;
    } catch (e) {
      console.error(e);
    }
  }
}
