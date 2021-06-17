/**
 * IMetaSelector is an interface to convert html element to some meta data.
 * Meta can be anything that can be used to compare html elements' similarity.
 * A basic meta data can be the html element itself
 */
export interface IMeta {
  tagName: string;
  className?: string;
  id?: string;
}
export interface IMetaQuerier {
  getMeta: (ele: HTMLElement) => IMeta;
}

export class BasicMetaQuerier implements IMetaQuerier {
  public getMeta(ele: HTMLElement): IMeta {
    return {
      id: ele.id,
      className: ele.className,
      tagName: ele.tagName,
    };
  }
}
