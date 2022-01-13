export interface IDataTransferFileItem<TFile> {
    kind: 'file';
    path: string;
    file: TFile;
}
export interface IDataTransferDirectoryItem<TFile> {
    kind: 'directory';
    path: string;
    child: Array<IDataTransferFileItem<TFile> | IDataTransferDirectoryItem<TFile> | undefined>;
}
export interface IDataTransferStringItem {
    kind: 'string';
    data: string;
    type: string;
}
export declare type IDataTransferItem<TFile> = IDataTransferFileItem<TFile> | IDataTransferDirectoryItem<TFile> | IDataTransferStringItem;
export declare const getSerializedDataTransferItemList: (dt: DataTransfer | null) => Promise<Array<IDataTransferItem<File> | undefined>>;
