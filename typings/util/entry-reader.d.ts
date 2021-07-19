export interface IDataTransferFileItem {
    kind: 'file';
    path: string;
    file: File;
}
export interface IDataTransferDirectoryItem {
    kind: 'directory';
    path: string;
    child: Array<IDataTransferFileItem | IDataTransferDirectoryItem | undefined>;
}
export interface IDataTransferStringItem {
    kind: 'string';
    data: string;
    type: string;
}
export declare type IDataTransferItem = IDataTransferFileItem | IDataTransferDirectoryItem | IDataTransferStringItem;
export declare const getSerializedDataTransferItemList: (dt: DataTransfer | null) => Promise<Array<IDataTransferItem | undefined>>;
