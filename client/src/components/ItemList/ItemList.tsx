import { useState } from "react";
import { Link } from "react-router-dom";

import {
  ItemListContextProps,
  useItemList,
  ItemListContextProvider,
} from "src/contexts/itemListContext";

import UploadItem, { Upload } from "../UploadItem/UploadItem";
import ActionBtn from "../ActionBtn/ActionBtn";
import QuickActions from "../QuickActions/QuickActions";
import TextItem from "../TextItem/TextItem";
import FolderItem from "../FolderItem/FolderItem";
import FileItem from "../FileItem/FileItem";
import ItemSlider from "../ItemSlider/ItemSlider";

import "./ItemList.scss";

export type UploadContent =
  | {
      isText: true;
      title?: string;
      text: string;
    }
  | {
      isText: false;
      files: FileList | null;
    };

function ItemListInner() {
  const {
    setItems,
    displayItems,
    loading,
    showQuickActions = true,
    isFolder,
    loadingFolderPath,
    folderPath,
    folderId,
    itemSliderOpen,
  } = useItemList();

  const [uploads, setUploads] = useState<Upload[]>([]);

  const [createEmptyFolder, setCreateEmptyFolder] = useState(false);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [uploadContent, setUploadContent] = useState<UploadContent | null>(
    null
  );

  const handleUpload = async (content: UploadContent, folder?: string) => {
    if (content.isText) {
      const res = await fetch("/api/text", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...content, folderId }),
      });

      const newItems = await res.json();
      setItems((prevItems) => newItems.concat(prevItems));
    } else {
      let data = new FormData();

      Array.from(content.files ?? []).forEach((f) => data.append("files", f));

      if (typeof folder !== "undefined") data.append("folder", folder);
      if (typeof folderId !== "undefined") data.append("folderId", folderId);

      let upload: Upload = {
        numberOfFiles: content.files?.length ?? 0,
        progress: 0,
      };

      setUploads((prev) => [upload, ...prev]);

      const req = new XMLHttpRequest();

      req.upload.addEventListener("progress", (e) => {
        upload.progress = e.loaded / e.total;
        // force re-render
        setUploads((prev) => [...prev]);
      });

      req.onload = () => {
        setUploads((prev) => [...prev.filter((u) => u !== upload)]);

        const newItems = req.status === 200 ? JSON.parse(req.responseText) : [];
        setItems((prevItems) => newItems.concat(prevItems));
      };

      req.open("post", "/api/file");
      req.send(data);
    }
  };

  const handleUploadAction = (content: UploadContent) => {
    if (content.isText || (content.files && content.files.length <= 1))
      return handleUpload(content);

    setCreateEmptyFolder(!content.files);
    setUploadContent(content);
    setFolderModalOpen(true);
  };

  const handleUploadAsFolder = async () => {
    if (!uploadContent) return;

    await handleUpload(uploadContent, folderName);
    setUploadContent(null);
    setFolderModalOpen(false);
  };

  const handleUploadStandalone = async () => {
    if (!uploadContent) return;

    await handleUpload(uploadContent);
    setUploadContent(null);
    setFolderModalOpen(false);
  };

  const handleCancelUpload = () => {
    setUploadContent(null);
    setFolderModalOpen(false);
  };

  return (
    <div className="items">
      {isFolder && Boolean(loadingFolderPath || folderPath?.length) && (
        <div className="items__header">
          {Boolean(folderPath?.length && !loadingFolderPath) ? (
            <>
              <div className="items__header__item">Home</div>
              {folderPath?.map((f) => (
                <Link
                  to={"/folder/" + f.id}
                  className="items__header__item"
                  key={f.id}
                >
                  {f.title}
                </Link>
              ))}
            </>
          ) : (
            <div className="items__header__loading">Loading</div>
          )}
        </div>
      )}
      <div className="items__wrapper">
        {loading &&
          [...Array(5)].map((_, i) => (
            <div
              key={i}
              data-testid={"dummy-" + i}
              className="items__dummy"
            ></div>
          ))}
        {!loading && showQuickActions && (
          <QuickActions upload={handleUploadAction} />
        )}
        {uploads.map((up, i) => (
          <UploadItem key={i} {...up} />
        ))}
        {!loading &&
          displayItems.map((item) => {
            if (item.type === "text")
              return <TextItem item={item} key={item.id} />;
            else if (item.type === "folder")
              return <FolderItem item={item} key={item.id} />;
            else return <FileItem item={item} key={item.id} />;
          })}
      </div>
      {folderModalOpen && (
        <div className="items__upload-modal">
          <div className="items__upload-modal__wrapper">
            <input
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              type="text"
              placeholder="Folder Name"
            />
            <ActionBtn
              onClick={handleUploadAsFolder}
              text={createEmptyFolder ? "Create Folder" : "Upload as Folder"}
              className="items__upload-modal__btn"
            />
            {!createEmptyFolder && (
              <>
                <div className="items__upload-modal__splitter">or</div>
                <ActionBtn
                  onClick={handleUploadStandalone}
                  text="Upload Files"
                  className="items__upload-modal__btn"
                />
              </>
            )}
            <div className="items__upload-modal__splitter">or</div>
            <ActionBtn
              onClick={handleCancelUpload}
              text="Cancel Upload"
              className="items__upload-modal__btn items__upload-modal__btn--cancel"
            />
          </div>
        </div>
      )}
      {itemSliderOpen && <ItemSlider />}
    </div>
  );
}

function ItemList(props: ItemListContextProps) {
  return (
    <ItemListContextProvider {...props}>
      <ItemListInner />
    </ItemListContextProvider>
  );
}

export default ItemList;
