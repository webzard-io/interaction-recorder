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

export type IDataTransferItem =
  | IDataTransferFileItem
  | IDataTransferDirectoryItem
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
): Promise<IDataTransferFileItem | IDataTransferDirectoryItem | undefined> => {
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
): Promise<Array<IDataTransferItem | undefined>> => {
  if (!dt || !dt.items.length) {
    return [];
  }
  const items = dt.items;
  const result = new Array<IDataTransferItem | undefined>(items.length);
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
