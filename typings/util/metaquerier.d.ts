export interface IMeta {
    tagName: string;
    className?: string;
    id?: string;
}
export interface IMetaQuerier {
    getMeta: (ele: HTMLElement) => IMeta;
}
export declare class BasicMetaQuerier implements IMetaQuerier {
    getMeta(ele: HTMLElement): IMeta;
}
