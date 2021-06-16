/**
 * IMetaSelector is an interface to convert html element to some meta data.
 * Meta can be anything that can be used to compare html elements' similarity.
 * A basic meta data can be the html element itself
 */
export interface IMetaQuerier<TMeta = HTMLElement> {
  getMeta: (ele: HTMLElement) => TMeta;
}

export class BasicMetaQuerier implements IMetaQuerier {
  public getMeta(ele: HTMLElement) {
    return ele;
  }
}
