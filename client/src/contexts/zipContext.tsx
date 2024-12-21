import { createContext, useContext, useState } from "react";
import { saveAs } from "file-saver";
import JSZip from "jszip";

import { FolderJson, Item } from "@backend-types/types";

enum FolderZipElementType {
  FOLDER,
  FILE,
}

type FolderZipElement =
  | {
      type: FolderZipElementType.FILE;
      name: string;
      blob: Blob;
    }
  | {
      type: FolderZipElementType.FOLDER;
      name: string;
      items: FolderZipElement[];
    };

async function fetchFile(url: string): Promise<Blob> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch file from ${url}`);
  }

  return await response.blob();
}

async function fetchFolder(folder: FolderJson): Promise<FolderZipElement> {
  const res = await fetch("/api/folder/" + folder.id);
  const folderItems: Item[] = await res.json();

  const subitems: FolderZipElement[] = [];

  // handle duplicate names
  const names: Record<string, number | undefined> = {};
  const addName = (name: string) => {
    const nameUsed = names[name];
    names[name] = nameUsed ? nameUsed + 1 : 1;
  };

  for (const item of folderItems) {
    let el: FolderZipElement;

    switch (item.type) {
      case "img":
      case "file": {
        const name = item.title;

        el = {
          type: FolderZipElementType.FILE,
          name,
          blob: await fetchFile("/cdn/" + item.id),
        };

        addName(name);

        break;
      }

      case "text": {
        const name = item.title + ".txt";

        el = {
          type: FolderZipElementType.FILE,
          name,
          blob: new Blob([item.text], {
            type: "text/plain",
          }),
        };

        addName(name);

        break;
      }

      case "folder": {
        el = await fetchFolder(item);
        addName(el.name);
        break;
      }
    }

    subitems.push(el);
  }

  // handle duplicate names
  for (const name in names) {
    const nameUsed = names[name];
    if (!nameUsed || nameUsed <= 1) continue;

    let renames = 1;

    for (const subitem of subitems) {
      if (subitem.name !== name) continue;
      subitem.name = `${renames}_${subitem.name}`;
      renames++;
    }
  }

  return {
    type: FolderZipElementType.FOLDER,
    name: folder.title,
    items: subitems,
  };
}

async function addToZip(zip: JSZip, el: FolderZipElement): Promise<void> {
  if (el.type === FolderZipElementType.FILE) {
    zip.file(el.name, el.blob);
  } else if (el.type === FolderZipElementType.FOLDER) {
    const folder = zip.folder(el.name);

    if (folder) {
      for (const item of el.items) {
        await addToZip(folder, item);
      }
    }
  }
}

export async function createZipFromFolderZipElement(
  rootElement: FolderZipElement
): Promise<Blob> {
  const zip = new JSZip();

  if (rootElement.type === FolderZipElementType.FOLDER) {
    for (const item of rootElement.items) {
      await addToZip(zip, item);
    }
  } else {
    throw new Error("Root element must be a folder");
  }

  return zip.generateAsync({ type: "blob" });
}

export interface ZipContextI {
  downloadFolder: (folder: FolderJson) => void;
  zipsInProgress: number;
}

export const ZipContext = createContext<ZipContextI>({
  downloadFolder: () => null,
  zipsInProgress: 0,
});

export const ZipContextProvider = (props: { children: React.ReactNode }) => {
  const [zipsInProgress, setZipsInProgress] = useState(0);

  const downloadFolder = async (folder: FolderJson) => {
    try {
      setZipsInProgress((p) => p + 1);

      const fetchedFolder = await fetchFolder(folder);
      const zip = await createZipFromFolderZipElement(fetchedFolder);

      saveAs(zip, folder.title + ".zip");
    } catch (err) {
      console.error(err);
    } finally {
      setZipsInProgress((p) => p - 1);
    }
  };

  return (
    <ZipContext.Provider value={{ downloadFolder, zipsInProgress }}>
      {props.children}
    </ZipContext.Provider>
  );
};

export const useZip = () => {
  return useContext(ZipContext);
};
