export interface IDataTransferFileItem<TFile> {
  kind: 'file';
  path: string;
  file: TFile;
}

export interface IDataTransferDirectoryItem<TFile> {
  kind: 'directory';
  path: string;
  child: Array<
    IDataTransferFileItem<TFile> | IDataTransferDirectoryItem<TFile> | undefined
  >;
}

export interface IDataTransferStringItem {
  kind: 'string';
  data: string;
  type: string;
}

export type IDataTransferItem<TFile> =
  | IDataTransferFileItem<TFile>
  | IDataTransferDirectoryItem<TFile>
  | IDataTransferStringItem;

const readDirectoryEntry = async (
  entry: FileSystemDirectoryEntry,
): Promise<FileSystemEntry[]> => {
  return new Promise((res, rej) => {
    const reader = entry.createReader();
    reader.readEntries(res, rej);
  });
};

const readFileEntry = async (entry: FileSystemFileEntry): Promise<File> => {
  return new Promise((res, rej) => {
    entry.file(res, rej);
  });
};

const readEntry = async (
  entry: FileSystemEntry | null,
): Promise<
  IDataTransferFileItem<File> | IDataTransferDirectoryItem<File> | undefined
> => {
  if (!entry) {
    return undefined;
  }
  if (entry.isFile) {
    const file = await readFileEntry(entry as FileSystemFileEntry);
    return {
      kind: 'file',
      path: entry.fullPath,
      file,
    };
  } else if (entry.isDirectory) {
    const childentries = await readDirectoryEntry(
      entry as FileSystemDirectoryEntry,
    );
    return {
      kind: 'directory',
      path: entry.fullPath,
      child: await Promise.all(
        childentries.map((entry) => {
          return readEntry(entry);
        }),
      ),
    };
  }
};

export const getSerializedDataTransferItemList = async (
  dt: DataTransfer | null,
): Promise<Array<IDataTransferItem<File> | undefined>> => {
  if (!dt || !dt.items.length) {
    return [];
  }
  const items = dt.items;
  const result = new Array<IDataTransferItem<File> | undefined>(items.length);
  {
    let i = 0;
    for (const item of items) {
      if (item.kind === 'string') {
        const stringitem: IDataTransferStringItem = {
          kind: 'string',
          data: dt.getData(item.type),
          type: item.type,
        };
        result[i] = stringitem;
      } else {
        result[i] = await readEntry(item.webkitGetAsEntry());
      }
      i++;
    }
  }
  return result;
};
