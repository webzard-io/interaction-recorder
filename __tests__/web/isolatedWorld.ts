import { Page, CDPSession, Protocol } from 'puppeteer/lib/types';
import * as fs from 'fs';
import * as path from 'path';

const ISOLATED_WORLD_NAME = '__puppeteer_utility_world__';

// throw exception when evalute error
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

/**
 * @class IsolatedWorld  
 * event dispatch by puppeteer will be captured by the isolated context's window, so we need to inject recorder to isolated context
 * but isolated context cannot be get directly, so we need to implement a function to get the isolated context.
 * And wrap it into a class.
 */
export class IsolatedWorld {
  private client: CDPSession;
  // remember the context id of isolated world
  private isolatedId: Promise<number>;
  // if recorder was injected
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
    // when a new isolated context of puppeteer was created, mark it as the target context and record id.
    const handler = (event: Protocol.Runtime.ExecutionContextCreatedEvent) => {
      const { id, name } = event.context;
      if (name === ISOLATED_WORLD_NAME) {
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

  // inject recorder and create some object to store data from recorder
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
  // give an interval parameter to fake the time is going;
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
        if(__pDate!==undefined){
          Date = __pDate;
          __pDate = undefined;
        }

        `,
        contextId: id,
      });
      return;
    } catch (e) {
      console.error(e);
    }
  }
}
