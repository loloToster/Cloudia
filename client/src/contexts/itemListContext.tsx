import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { ClientItem, FolderJson } from "@backend-types/types";
import { useSearch } from "./searchContext";
import { useCachedState } from "./cacheContext";

export interface ItemListContextProps {
  apiUrl: string;
  showQuickActions?: boolean;
  folderId?: string;
}

type SetState<T> = Dispatch<SetStateAction<T>>;

type PinFunc = (ids: string[], pin?: boolean) => void;
type IdFunc = (id: string) => void;
type RmItemsFunc = (ids: string[]) => void;

export interface ItemListContextI {
  items: ClientItem[];
  displayItems: ClientItem[];
  setItems: SetState<ClientItem[]>;
  loading: boolean;
  showQuickActions?: boolean;
  isFolder: boolean;
  folderPath: FolderJson[];
  loadingFolderPath: boolean;
  folderId?: string;
  itemSliderOpen: boolean;
  setItemSliderOpen: SetState<boolean>;
  openSlider: IdFunc;
  closeSlider: () => void;
  itemSliderInit: ClientItem | null;
  pinItems: PinFunc;
  rmItem: IdFunc;
  rmItems: RmItemsFunc;
  selectItem: IdFunc;
  handleSelect: IdFunc;
  handleRangeSelect: IdFunc;
  handlePin: IdFunc;
  handleUnpin: IdFunc;
  handleTrash: IdFunc;
  handleRestore: IdFunc;
  handleDelete: IdFunc;
}

export const ItemListContext = createContext<ItemListContextI>({
  items: [],
  displayItems: [],
  setItems: () => {},
  loading: true,
  showQuickActions: true,
  isFolder: false,
  folderPath: [],
  loadingFolderPath: true,
  itemSliderOpen: false,
  setItemSliderOpen: () => {},
  openSlider: () => {},
  closeSlider: () => {},
  itemSliderInit: null,
  pinItems: () => {},
  rmItem: () => {},
  rmItems: () => {},
  selectItem: () => {},
  handleSelect: () => {},
  handleRangeSelect: () => {},
  handlePin: () => {},
  handleUnpin: () => {},
  handleTrash: () => {},
  handleRestore: () => {},
  handleDelete: () => {},
});

export const ItemListContextProvider = (
  props: {
    children: React.ReactNode;
  } & ItemListContextProps
) => {
  const { searchQuery } = useSearch();

  // ITEMS
  const loadingKey = "loading:" + props.apiUrl;
  const itemsKey = "items:" + props.apiUrl;
  const [loading, setLoading] = useCachedState(loadingKey, true);
  const [items, setItems] = useCachedState<ClientItem[]>(itemsKey, []);

  const apiUrlRef = useRef(props.apiUrl);

  useEffect(() => {
    apiUrlRef.current = props.apiUrl;
  }, [props.apiUrl]);

  useEffect(() => {
    fetch(props.apiUrl)
      .then(async (data) => {
        const json = await data.json();

        if (props.apiUrl === apiUrlRef.current)
          setItems(json.map((i: any) => ({ ...i, selected: false })));
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (props.apiUrl === apiUrlRef.current) setLoading(false);
      });
  }, [props.apiUrl, setItems, setLoading, itemsKey, loadingKey]);

  const sortItems = (items: ClientItem[]) => {
    return items
      .sort((a, b) => b.created_at - a.created_at)
      .sort((a, b) => b.pinned - a.pinned);
  };

  const pinItems: PinFunc = (ids, pin = false) =>
    setItems((prev) =>
      prev.map((i) => (ids.includes(i.id) ? { ...i, pinned: pin ? 1 : 0 } : i))
    );

  const rmItem: IdFunc = (id) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const rmItems: RmItemsFunc = (ids) =>
    setItems((prev) => prev.filter((i) => !ids.includes(i.id)));

  const selectItem: IdFunc = (id) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i))
    );

  // select
  const shiftSelectBorderItem = useRef<string | null>(null);

  useEffect(() => {
    const onWindowClick = (e: MouseEvent) => {
      // todo: remove magic string
      const clickOnItem = e
        .composedPath()
        .some((el) => (el as HTMLElement).classList?.contains("item"));

      if (clickOnItem) return;

      setItems((prev) => prev.map((i) => ({ ...i, selected: false })));
      shiftSelectBorderItem.current = null;
    };

    window.addEventListener("click", onWindowClick);
    return () => window.removeEventListener("click", onWindowClick);
  }, [setItems]);

  const beforeSelect = () => {
    if (items.every((i) => i.id !== shiftSelectBorderItem.current))
      shiftSelectBorderItem.current = null;
  };

  const handleSelect: IdFunc = (id) => {
    beforeSelect();

    shiftSelectBorderItem.current = id;
    selectItem(id);
  };

  const handleRangeSelect: IdFunc = (id) => {
    beforeSelect();

    if (!shiftSelectBorderItem.current) {
      shiftSelectBorderItem.current = id;
      selectItem(id);
      return;
    } else if (shiftSelectBorderItem.current === id) {
      setItems((prev) => prev.map((i) => ({ ...i, selected: i.id === id })));
      return;
    }

    let inRange = false;

    setItems((prev) =>
      prev.map((i) => {
        let lastOrFirst = false;

        if (i.id === shiftSelectBorderItem.current || i.id === id) {
          inRange = !inRange;
          lastOrFirst = true;
        }

        return { ...i, selected: inRange || lastOrFirst };
      })
    );
  };

  // actions
  const handleItemRemoval = async (
    id: string,
    type: "restore" | "trash" | "delete"
  ) => {
    const hardDelete = type === "delete";
    const method = hardDelete ? "DELETE" : "PATCH";
    const apiPath = hardDelete ? "" : type;

    if (items.find((i) => i.id === id)?.selected) {
      const selectedIds = items.filter((i) => i.selected).map((i) => i.id);

      let res = await fetch(`/api/items/${apiPath}`, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (res.ok) rmItems(selectedIds);
    } else {
      let res = await fetch(`/api/item/${id}/${apiPath}`, { method });
      if (res.ok) rmItem(id);
    }
  };

  const handleItemPin = async (id: string, type: "pin" | "unpin") => {
    if (items.find((i) => i.id === id)?.selected) {
      const selectedIds = items.filter((i) => i.selected).map((i) => i.id);

      let res = await fetch(`/api/items/${type}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (res.ok) pinItems(selectedIds, type === "pin");
    } else {
      let res = await fetch(`/api/item/${id}/${type}`, { method: "PATCH" });
      if (res.ok) pinItems([id], type === "pin");
    }
  };

  const handlePin = (id: string) => {
    handleItemPin(id, "pin");
  };

  const handleUnpin = (id: string) => {
    handleItemPin(id, "unpin");
  };

  const handleTrash = (id: string) => {
    handleItemRemoval(id, "trash");
  };

  const handleRestore = (id: string) => {
    handleItemRemoval(id, "restore");
  };

  const handleDelete = (id: string) => {
    handleItemRemoval(id, "delete");
  };

  // FOLDER
  const loadingFolderPathKey = "loadingfolderpath:" + props.folderId;
  const folderPathKey = "folderpath:" + props.folderId;
  const [loadingFolderPath, setLoadingFolderPath] = useCachedState(
    loadingFolderPathKey,
    true
  );
  const [folderPath, setFolderPath] = useCachedState<FolderJson[]>(
    folderPathKey,
    []
  );
  const [isFolder, setIsFolder] = useState(Boolean(props.folderId));

  const folderIdRef = useRef(props.folderId);

  useEffect(() => {
    folderIdRef.current = props.folderId;
  }, [props.folderId]);

  useEffect(() => {
    setIsFolder(Boolean(props.folderId));
    if (!props.folderId) return;

    fetch("/api/folderpath/" + props.folderId)
      .then(async (data) => {
        const json = await data.json();

        if (props.folderId === folderIdRef.current) setFolderPath(json);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (props.folderId === folderIdRef.current) setLoadingFolderPath(false);
      });
  }, [props.folderId, setFolderPath, setLoadingFolderPath]);

  // SLIDER
  const [itemSliderOpen, setItemSliderOpen] = useState(false);
  const [itemSliderInit, setItemSliderInit] = useState<null | ClientItem>(null);

  const openSlider: IdFunc = (id) => {
    setItemSliderInit(items.find((i) => i.id === id) ?? null);
    setItemSliderOpen(true);
  };

  const closeSlider = () => {
    setItemSliderInit(null);
    setItemSliderOpen(false);
  };

  return (
    <ItemListContext.Provider
      value={{
        items,
        displayItems: sortItems(
          items.filter((i) => {
            if (!searchQuery.length) return true;

            const sq = searchQuery.toLowerCase();

            return (
              i.title.toLowerCase().includes(sq) ||
              (i.type === "text" && i.text.toLowerCase().includes(sq))
            );
          })
        ),
        setItems,
        loading,
        showQuickActions: props.showQuickActions,
        isFolder,
        folderPath,
        loadingFolderPath,
        folderId: props.folderId,
        itemSliderOpen,
        setItemSliderOpen,
        openSlider,
        closeSlider,
        itemSliderInit,
        pinItems,
        rmItem,
        rmItems,
        selectItem,
        handleSelect,
        handleRangeSelect,
        handlePin,
        handleUnpin,
        handleTrash,
        handleRestore,
        handleDelete,
      }}
    >
      {props.children}
    </ItemListContext.Provider>
  );
};

export const useItemList = () => {
  return useContext(ItemListContext);
};
